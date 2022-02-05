import mapboxgl from "mapbox-gl";
import tilebelt from '@mapbox/tilebelt'
import * as turf from '@turf/turf'
import {Image} from "image-js";
import fileUtils from './fs-helpers'

function getTileInfo(lng, lat, map) {
    let tileInfo = {}
    let zoom = Math.floor(map.getZoom());
    let widthInMeters = 40075016.686 * Math.abs(Math.cos(lat)) / Math.pow(2, zoom);
    let metersPerPixel = widthInMeters / 512;

    let xyzpoint = tilebelt.pointToTile(lng, lat, zoom)

    tileInfo.z = zoom
    tileInfo.x = xyzpoint[0]
    tileInfo.y = xyzpoint[1]
    tileInfo.long = lng
    tileInfo.lat = lat
    tileInfo.tileWidthInMeters = widthInMeters
    tileInfo.metersPerPixel = metersPerPixel
    tileInfo.polygon_bb = getTileGeoJsonBB(tileInfo)
    tileInfo.mapbox_tile_name = tileInfo.z + "-" + tileInfo.x + "-" + tileInfo.y
    tileInfo.rgbFileName = 'terrain-rgb' + "-" + tileInfo.mapbox_tile_name + '.png'
    tileInfo.thirtytwoFile = {name: 'thirtytwo' + "-" + tileInfo.mapbox_tile_name + '.png', bitDepth: 32}
    tileInfo.sixteenFile = {name: 'sixteen' + "-" + tileInfo.mapbox_tile_name, bitDepth: 16}

    let tile = [tileInfo.x, tileInfo.y, tileInfo.z] // x,y,z

    let bbox = tilebelt.tileToBBOX(tile);
    tileInfo.bbox = bbox

    const llb = new mapboxgl.LngLatBounds(tileInfo.bbox);
    let center = llb.getCenter(); // = LngLat {lng: -73.96365, lat: 40.78315}
    tileInfo.bbox_center = center

    return tileInfo
}

function getFeaturesFromBB(map, bbox) {
    if (bbox) {
        let sw = [bbox.geometry.coordinates[0][4]]
        let ne = [bbox.geometry.coordinates[0][2]]
        const swLonglat = new mapboxgl.LngLat(sw[0][0], sw[0][1]);
        const neLonglat = new mapboxgl.LngLat(ne[0][0], ne[0][1]);
        const swPt = map.project(swLonglat)
        const nePt = map.project(neLonglat)
        const features = map.queryRenderedFeatures(
            [swPt, nePt]
        )
        return features
    }
}


/**
 * Load image-js image from array
 *
 * @param {ArrayBuffer} imageArray ArrayBuffer representing image values
 * @return {image-js} Image-js image.
 */
async function loadImageFromArray(imageArray) {
    let image = await Image.load(imageArray)
    return image
}

/**
 * Calculate height in meters from RGB height encoded pixels using Mapbox formula.
 *
 * @param {int} r Red pixel channel
 * @param {int} g Green pixel channel
 * @param {int} b Blue pixel channel
 * @return {height} New height value.
 */
function getHeightFromRgb(r, g, b) {
    return -10000 + ((r * 256 * 256 + g * 256 + b) * 0.1);
}

/**
 * Decode rgb height from image.
 *
 * @param {image-js} image Image created from image-js
 * @return {int[]} Decoded height array.
 */
function getHeightArray(image) {
    let decodedHeightArray = []
    let pixelsArray = image.getPixelsArray()
    for (const pixel of pixelsArray) {
        let r = pixel[0]
        let g = pixel[1]
        let b = pixel[2]
        let height = getHeightFromRgb(r, g, b)
        decodedHeightArray.push(height)
    }

    //Get center elevations range and add that to height values to set Unreal Landscape at sea level
    // let median = getMedianArray(decodedHeightArray)
    // let adjustedHeightArray = decodedHeightArray.map(x => x + median);


    // stats.unrealZscale = ((stats.maxElevation/512) * 100)
    // console.log(stats.unrealZscale)

    return decodedHeightArray
}


/**
 * Calculate Medium value of array
 *
 * @param {int[]} array of integers.
 * @return {int} integer Median value.
 */
function getMedianArray(array) {
    const arr = array.filter(val => !!val);
    const sum = arr.reduce((sum, val) => (sum += val));
    const len = arr.length;

    const arrSort = arr.sort();
    const mid = Math.ceil(len / 2);

    const median = len % 2 == 0 ? (arrSort[mid] + arrSort[mid - 1]) / 2 : arrSort[mid - 1];

    return median
}


/**
 * Download RGB terrain png from Mapbox api
 *
 * @param {string} mapbox_rgb_image_url Request url to Mapbox api.
 * @return {ArrayBuffer} arrBuffer of image information.
 */
async function downloadTerrainRgb(mapbox_rgb_image_url) {
    //Fetch png tile from mapbox
    const response = await fetch(mapbox_rgb_image_url);
    let arrBuffer = response.arrayBuffer()
    return arrBuffer
}


/**
 * Check if RGB exists else initiate download
 *
 * @param {FileSystemDirHandle} dirHandle Dir handle to write to.
 * @param {object} tile_info Tile information for file name.
 * @param {string} mapbox_rgb_image_url Request url to Mapbox api.
 * @return {image-js} Image-js image.
 */
async function getMapboxTerrainRgb(dirHandle, tile_info, mapbox_rgb_image_url) {
    let rgbImageArrayBuffer
    let bFileExists = await fileUtils.fileExists(dirHandle, tile_info.rgbFileName)
    let image
    if (bFileExists === false) {
        rgbImageArrayBuffer = await downloadTerrainRgb(mapbox_rgb_image_url)
    } else {
        rgbImageArrayBuffer = await fileUtils.readFileFromDisk(dirHandle, tile_info.rgbFileName)
    }
    image = await loadImageFromArray(rgbImageArrayBuffer)
    return image
}

/**
 * Convert image to specified bit and color
 *
 * @param {int} width Image width.
 * @param {int} height Image width.
 * @param {int[]} imageArray Uint16Array representing image values
 * @param {int} bitDepth image-js bit depth example 8,16,32
 * @param {string} colorModel image-js color madel string.
 * @return {image-js} Image-js image.
 */
function convertImage(width, height, imageArray, bitDepth, colorModel) {
    let newImage = new Image(width, height, imageArray, {kind: colorModel, bitDepth: bitDepth})
    return newImage
}


/**
 * Calculate Medium value of array
 *
 * @param {image-js} image Image created from image-js
 * @param {int} bitDepth image-js bit depth example 8,16,32
 * @param {string} colorModel image-js color madel string.
 * @return {object} image_info Obect containing image and stats
 */
function createHeightMapImage(image, bitDepth, colorModel) {
    let image_info = {}
    let decodedHeightArray = getHeightArray(image)
    let out_image = convertImage(image.width, image.height, decodedHeightArray, bitDepth, colorModel)

    image_info.minElevation = image.min[0];
    image_info.maxElevation = image.max[0];
    image_info.image = out_image

    return image_info
}


function getTileGeoJsonBB(tile_info) {
    let tile = [tile_info.x, tile_info.y, tile_info.z] // x,y,z
    let bbox = tilebelt.tileToBBOX(tile);
    let poly = turf.bboxPolygon(bbox);

    let geoJson = {
        'type': 'Feature',
        'geometry': {
            'type': poly.geometry.type,
            'coordinates': poly.geometry.coordinates
        }
    };
    return geoJson;

}

export default {getTileInfo, getFeaturesFromBB, getMapboxTerrainRgb, createHeightMapImage, loadImageFromArray}
