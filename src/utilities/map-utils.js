import mapboxgl from "mapbox-gl";
import tilebelt from '@mapbox/tilebelt'
import * as turf from '@turf/turf'
import {Image} from "image-js";
import fileUtils from './fs-helpers'
import idbKeyval from "../utilities/idb-keyval-iife";


function getTileInfo(lng, lat, map) {
  let tileInfo = {}
  let zoom = Math.floor(map.getZoom());
  let widthInMeters = 40075016.686 * Math.abs(Math.cos(lat)) / Math.pow(2, zoom);
  let metersPerPixel = widthInMeters / 512;
  let xyzpoint = tilebelt.pointToTile(lng, lat, zoom)

  tileInfo.z = zoom
  tileInfo.x = xyzpoint[0]
  tileInfo.y = xyzpoint[1]
  tileInfo.pointLng = lng
  tileInfo.pointLat = lat
  tileInfo.tileWidthInMeters = widthInMeters
  tileInfo.metersPerPixel = metersPerPixel
  tileInfo.mapboxTileName = tileInfo.z + "-" + tileInfo.x + "-" + tileInfo.y
  tileInfo.tile = [tileInfo.x, tileInfo.y, tileInfo.z] // x,y,z
  tileInfo.bbox = tilebelt.tileToBBOX(tileInfo.tile);
  tileInfo.polygon_bb = getTileGeoJsonBB(tileInfo.bbox)

  const llb = new mapboxgl.LngLatBounds(tileInfo.bbox);
  tileInfo.bboxCT = llb.getCenter();
  tileInfo.bboxSW = llb.getSouthWest()
  tileInfo.bboxNE = llb.getNorthEast()
  tileInfo.bboxNW = llb.getNorthWest()
  tileInfo.bboxSE = llb.getSouthEast()

  tileInfo.topLeft = tileInfo.bboxNW
  tileInfo.bottomLeft = tileInfo.bboxSW
  tileInfo.topRight = tileInfo.bboxNE
  tileInfo.bottomRight = tileInfo.bboxSE
  tileInfo.center = tileInfo.bboxCT


 // tileInfo.originCoordinates = tileInfo.bboxNW  //NW corner usually considered Origin coordinates

  // let convUtm = converLatLngTotUtm(tileInfo.originCoordinates.lat, tileInfo.originCoordinates.lng)
  // tileInfo.projected = new mapboxgl.LngLat(tileInfo.originCoordinates.lng, tileInfo.originCoordinates.lat);
  // tileInfo.epsg = getEpsg(tileInfo.originCoordinates.lat, tileInfo.originCoordinates.lng)
  // tileInfo.OriginEasting = convUtm.easting
  // tileInfo.OriginNorthing = convUtm.northing
  // tileInfo.zoneLetter = convUtm.zoneLetter
  // tileInfo.zoneNum = convUtm.zoneNum
  // tileInfo.originLng = tileInfo.originCoordinates.lng
  // tileInfo.originLat = tileInfo.originCoordinates.lat

  tileInfo.maxPngValue = 65535
  tileInfo.rgbFileName = 'terrain-rgb' + '-' + tileInfo.mapboxTileName + '.png'
  tileInfo.thirtyTwoFileName = 'thirtytwo' + '-' + tileInfo.mapboxTileName + '.png'
  tileInfo.tileInfoFileName = 'tile-info' + '-' + tileInfo.mapboxTileName + '.json'
  tileInfo.geoJsonFileName = 'geojson' + '-' + tileInfo.mapboxTileName + '.json'

  // convUtm = converLatLngTotUtm(tileInfo.pointLat, tileInfo.pointLng)
  // tileInfo.pointNorthing = convUtm.northing
  // tileInfo.pointEasting = convUtm.easting
  //
  // convUtm = converLatLngTotUtm(tileInfo.bboxCT.lat, tileInfo.bboxCT.lng)
  // tileInfo.ctNorthing = convUtm.northing
  // tileInfo.ctEasting = convUtm.easting
  //
  // convUtm = converLatLngTotUtm(tileInfo.bboxSW.lat, tileInfo.bboxSW.lng)
  // tileInfo.swNorthing = convUtm.northing
  // tileInfo.swEasting = convUtm.easting
  //
  // convUtm = converLatLngTotUtm(tileInfo.bboxNE.lat, tileInfo.bboxNE.lng)
  // tileInfo.neNorthing = convUtm.northing
  // tileInfo.neEasting = convUtm.easting
  //
  // convUtm = converLatLngTotUtm(tileInfo.bboxNW.lat, tileInfo.bboxNW.lng)
  // tileInfo.nwNorthing = convUtm.northing
  // tileInfo.nwEasting = convUtm.easting
  //
  // convUtm = converLatLngTotUtm(tileInfo.bboxSE.lat, tileInfo.bboxSE.lng)
  // tileInfo.seNorthing = convUtm.northing
  // tileInfo.seEasting = convUtm.easting


  //Calc Unreal x y


  //Mouse click
  //
  // let TerrainSizeInUU = 2017 * 100
  //
  //
  // let utm_point = utm.fromLatLon(tileInfo.bboxNE.lat, tileInfo.bboxNE.lng)
  //
  // tileInfo.MaximumEasting = utm_point.easting
  // tileInfo.MaximumNorthing = utm_point.northing
  //
  //
  // utm_point = utm.fromLatLon(tileInfo.bboxSW.lat, tileInfo.bboxSW.lng)
  //
  // tileInfo.MinimumEasting = utm_point.easting
  // tileInfo.MinimumNorthing = utm_point.northing
  //
  //
  // tileInfo.XInUU = (((tileInfo.pointEasting - tileInfo.MinimumEasting) / (tileInfo.MaximumEasting - tileInfo.MinimumEasting)) * TerrainSizeInUU) - (TerrainSizeInUU * 0.5)
  // tileInfo.YInUU = -1. * ((((tileInfo.pointNorthing - tileInfo.MinimumNorthing) / (tileInfo.MaximumNorthing - tileInfo.MinimumNorthing)) * TerrainSizeInUU) - (TerrainSizeInUU * 0.5))
  //

  return tileInfo
}

// function getEpsg(lat, lng) {
//   let offset = Math.round((183 + lng) / 6)
//   let epsg = 0
//   if (lat > 0) {
//     epsg = 32600 + offset
//   } else {
//     epsg = 32700 + offset
//   }
//   return epsg
// }

// function converLatLngTotUtm(lat, lng) {
//   return utm.fromLatLon(lat, lng)
// }

// function convertGeoJsonCoordinatesToUTM(features) {
//   features.forEach(geojson => {
//     let coordinates = geojson.geometry.coordinates
//     traverseArray(coordinates)
//   });
//   return features
// }

// function traverseArray(arr) {
//   let i = 0
//   let lng
//   let lat
//
//   arr.forEach((element, index) => {
//     if (Array.isArray(element)) {
//       traverseArray(element);
//     } else {
//       if (i === 0) {
//         lng = element
//       }
//       if (i === 1) {
//         lat = element
//         let convUtm = converLatLngTotUtm(lat, lng)
//         arr[0] = convUtm.northing
//         arr[1] = convUtm.easting
//       }
//       i = i + 1
//       if (i === 2) {
//         i = 0
//       }
//     }
//   });
// }


function getTileGeoJsonBB(bbox) {
  let poly = turf.bboxPolygon(bbox);
  let geoJson = {
    'type': 'Feature', 'geometry': {
      'type': poly.geometry.type, 'coordinates': poly.geometry.coordinates
    }
  };

  return geoJson;
}

function getFeaturesFromBB(map, tile_info) {
  tile_info.swPt = map.project(tile_info.bboxSW)
  tile_info.nePt = map.project(tile_info.bboxNE)
  tile_info.nwPt = map.project(tile_info.bboxNW)
  tile_info.sePt = map.project(tile_info.bboxSE)
   let features = map.queryRenderedFeatures([tile_info.swPt, tile_info.nePt])

  return features
}
//function showLayerID(map) {
  //let compositeSource = map.getLayer(mapLayerId.toString()).source;
//  const sourceId = map.getLayer('park').source;
//  map.getSource('id_of_your_source');
//   let test = map.getStyle().sourceCaches
//   console.log(test)
// }
  // map.querySourceFeatures('composite', {sourceLayer: 'road'})
  //map.querySourceFeatures('composite', {sourceLayer: 'source-name', filter: [filters]})
  //let features = map.querySourceFeatures('composite')
  // const sourceId = Object.keys(map.getStyle().sources)
  // const sourceId = Object.keys(map.getStyle().sources)
  //let compositeSource=map.getSource('composite').vectorLayerIds
  // let compositeSource = map.getLayer("road").source;
 // console.log(compositeSource)

  // let test = map.getStyle().sources
  // console.log(test)
  // console.log(map.getLayer('road'));
  // let test = map.style.getLayer('park');
  // let test = map.getStyle();
  // "road-motorway-trunk"
  // console.log(test)
 // let test = map.querySourceFeatures('composite', {sourceLayer: 'road'})
  //
 // console.log(test)
  // console.log(map.getSource("composite").vectorLayers);
//}
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
    height = parseFloat(height)
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
  let arrBuffer = await response.arrayBuffer()

  return arrBuffer
}

async function unrealRemoteControl(data, url) {
  const requestOptions = {
    method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)
  };
  const response = await fetch(url, requestOptions);

  const dataJson = await response.json();

  return dataJson
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
  idbKeyval.set('rgbImageArrayBuffer', rgbImageArrayBuffer)
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
  idbKeyval.set('decodedHeightArray', decodedHeightArray)
  let out_image = convertImage(image.width, image.height, decodedHeightArray, bitDepth, colorModel)


  image_info.minElevation = out_image.min[0];
  image_info.maxElevation = out_image.max[0];
  image_info.image = out_image
  image_info.decodedHeightArray = decodedHeightArray

  return image_info
}

export default {
  getTileInfo,
  getFeaturesFromBB,
  getMapboxTerrainRgb,
  createHeightMapImage,
  loadImageFromArray,
  unrealRemoteControl,
  downloadTerrainRgb
}
