import mapboxgl from "mapbox-gl";
import tilebelt from '@mapbox/tilebelt'
import * as turf from '@turf/turf'
import {Image} from "image-js";
import idbKeyval from "../utilities/idb-keyval-iife";



function getTileInfo(lng, lat, multiple, x, y, z, bbox) {
  let tileInfo = {}
  let xyzpoint


  if (multiple === false) {
    xyzpoint = tilebelt.pointToTile(lng, lat, z)
    x = xyzpoint[0]
    y = xyzpoint[1]
  }

  let widthInMeters = 40075016.686 * Math.abs(Math.cos(lat)) / Math.pow(2, z);
  let metersPerPixel = widthInMeters / 512;

  tileInfo.z = z
  tileInfo.x = x
  tileInfo.y = y
  tileInfo.pointLng = lng
  tileInfo.pointLat = lat
  tileInfo.tileWidthInMeters = widthInMeters
  tileInfo.metersPerPixel = metersPerPixel
  tileInfo.mapboxTileName = tileInfo.z + "-" + tileInfo.x + "-" + tileInfo.y
  tileInfo.tile = [tileInfo.x, tileInfo.y, tileInfo.z] // x,y,z
  if (multiple === false) {
    tileInfo.bbox = tilebelt.tileToBBOX(tileInfo.tile);
  } else {
    tileInfo.bbox = bbox;
  }
  //tileInfo.bbox = tilebelt.tileToBBOX(tileInfo.tile);
  tileInfo.polygon_bb = getTileGeoJsonBB(tileInfo.bbox)
  tileInfo.area_bb = getAreaBB(tileInfo.bbox)

  const llb = new mapboxgl.LngLatBounds(tileInfo.bbox);

  //Corners of bbox
  tileInfo.bboxCT = llb.getCenter();
  tileInfo.bboxSW = llb.getSouthWest()
  tileInfo.bboxNE = llb.getNorthEast()
  tileInfo.bboxNW = llb.getNorthWest()
  tileInfo.bboxSE = llb.getSouthEast()

  //Edge of bbox
  tileInfo.bboxW = llb.getWest().toFixed(5)
  tileInfo.bboxS = llb.getSouth().toFixed(5)
  tileInfo.bboxE = llb.getEast().toFixed(5)
  tileInfo.bboxN = llb.getNorth().toFixed(5)

  tileInfo.topLeft = tileInfo.bboxNW
  tileInfo.bottomLeft = tileInfo.bboxSW
  tileInfo.topRight = tileInfo.bboxNE
  tileInfo.bottomRight = tileInfo.bboxSE
  tileInfo.center = tileInfo.bboxCT


  const topLeft = turf.point([tileInfo.bboxNE.lng, tileInfo.bboxNE.lat]);
  const topRight = turf.point([tileInfo.bboxSW.lng, tileInfo.bboxNE.lat]);
  const bottomLeft = turf.point([tileInfo.bboxNE.lng, tileInfo.bboxSW.lat]);
  const bottomRight = turf.point([tileInfo.bboxSW.lng, tileInfo.bboxSW.lat]);
  const middleLeft = turf.midpoint(topLeft, bottomLeft);
  const middleRight = turf.midpoint(topRight, bottomRight);
  tileInfo.distance = turf.distance(middleLeft, middleRight, 'kilometers').toFixed(2);

  tileInfo.maxPngValue = 65535
  tileInfo.rgbFileName = 'terrain-rgb' + '-' + tileInfo.mapboxTileName + '.png'
  tileInfo.thirtyTwoFileName = 'thirtytwo' + '-' + tileInfo.mapboxTileName + '.png'
  tileInfo.tileInfoFileName = 'tile-info' + '-' + tileInfo.mapboxTileName + '.json'
  tileInfo.geoJsonFileName = 'geojson' + '-' + tileInfo.mapboxTileName + '.json'

  return tileInfo
}

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

function getAreaBB(bbox) {

  let poly = turf.bboxPolygon(bbox);
  let area = turf.area(poly);
  return area
}

function getTileGeoJsonBB(bbox) {
  let poly = turf.bboxPolygon(bbox);
  let geoJson = {
    'type': 'Feature', 'geometry': {
      'type': poly.geometry.type, 'coordinates': poly.geometry.coordinates
    }
  };
  return geoJson;
}

function getFeaturesFromBB(map, tile_info, combine) {
  tile_info.swPt = map.project(tile_info.bboxSW)
  tile_info.nePt = map.project(tile_info.bboxNE)
  tile_info.nwPt = map.project(tile_info.bboxNW)
  tile_info.sePt = map.project(tile_info.bboxSE)
  let features = map.queryRenderedFeatures([tile_info.swPt, tile_info.nePt])

  if (combine === true) {
    features = getUniqueFeatures(features)
  }
  return features

}

// Because features come from tiled vector data,
// feature geometries may be split
// or duplicated across tile boundaries.
// As a result, features may appear
// multiple times in query results.
function getUniqueFeatures(features) {
  const uniqueIds = new Set();
  const uniqueFeatures = [];
  for (const feature of features) {
    const name = feature.properties["name"];
    const type = feature.geometry["type"];
    let id = name + '-' + type
    if (!uniqueIds.has(id)) {
      uniqueIds.add(id);
      uniqueFeatures.push(feature);
    }
  }
  return uniqueFeatures;
}

/**
 * Load image-js image from array
 *
 * @param {ArrayBuffer} imageArray ArrayBuffer representing image values
 * @return {image-js} Image-js image.
 */
async function loadImageFromArray(imageArray) {
  try {
    let image = await Image.load(imageArray)
    return image
  } catch (e) {
    console.log(e)
  }
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
  let response, dataJson = {}, error = ''

  const requestOptions = {
    method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)
  };

  try {
    response = await fetch(url, requestOptions);
  } catch (e) {
    error = e
  }

  dataJson.response = response
  dataJson.error = error

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
async function getMapboxTerrainRgb(mapbox_rgb_image_url) {
  let rgbImageArrayBuffer
  let image

  rgbImageArrayBuffer = await downloadTerrainRgb(mapbox_rgb_image_url)
  image = await loadImageFromArray(rgbImageArrayBuffer)
  idbKeyval.set('rgbImageArrayBuffer', rgbImageArrayBuffer)
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
  downloadTerrainRgb,
  convertImage,
  getTileGeoJsonBB
}
