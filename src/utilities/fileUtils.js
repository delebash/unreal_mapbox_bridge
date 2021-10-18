import {Image} from 'image-js'
import {createStore, get, set} from 'idb-keyval'
// import Jimp from 'jimp/browser/lib/jimp';
const db = createStore('unreal_mapbox', 'user_settings');

let decodedHeightArray = []
let SCALE_16_BIT = 65535;
let SCALE_8_BIT = 255;

// Example: WASM Loader (move this into some utility/helper file for reuse)
async function loadWasm(url, importObject){

  const result = await WebAssembly.instantiateStreaming(fetch(url), importObject);
  return result.instance; // or, return result;
}
async function downloadTerrainRgb(mapbox_rgb_image_url) {
  //Fetch png tile from mapbox
  const response = await fetch(mapbox_rgb_image_url);
  let arrBuffer = response.arrayBuffer()
  return arrBuffer
}

async function getMapboxTerrainRgb(dir_handle, tile_info, mapbox_rgb_image_url) {
  let rgbImageArrayBuffer

  let bFileExists = await fileExists(dir_handle, tile_info.rgbFileName)
  let image
  if (bFileExists === false) {
    rgbImageArrayBuffer = await downloadTerrainRgb(mapbox_rgb_image_url)
  } else {
    rgbImageArrayBuffer = await readFileFromDisk(dir_handle, tile_info.rgbFileName)
  }

  image = await loadImageFromArray(rgbImageArrayBuffer)
  // let imageInfo = {}
  // imageInfo.image = image
  // imageInfo.arry = rgbImageArrayBuffer

  return image
}

async function convertImage(width, height, imageArray, bitDepth, colorModel) {
  let newImage = new Image(width, height, imageArray, {kind: colorModel, bitDepth: bitDepth})
  return newImage
}

async function loadImageFromArray(imageArray) {
  let image = await Image.load(imageArray)
  return image
}

async function createHeightMapImage(rgbImage, bitDepth, colorModel) {

  // let newImage
  //Create preview image
  // if(size) {
  //    newImage = rgbImage.resize({
  //     interpolationType: "BICUBIC", // or "BILINEAR" or "NEAREST", in order of decreasing quality
  //     width: size,
  //     preserveAspectRatio: true // Or height: number
  //   });
  // }else{
  //   newImage = rgbImage
  // }
  //
  // // let img = newImage.blurFilter()

  let height_array_stats = await getHeightArrayStats(rgbImage)

  let image = await convertImage(height_array_stats.stats.width, height_array_stats.stats.height, height_array_stats.decodedHeightArray, bitDepth, colorModel)
  height_array_stats.image = image
  return height_array_stats
}

//Cheaper to just convert in memory array then to read cached file from disk
//
// previewImageInfo.blob = image.toBlob()
async function getHeightArrayStats(image) {
  let decodedHeightArray = []
  let stats = {}
  stats.minElevation = Number.MAX_VALUE;
  stats.maxElevation = Number.MIN_VALUE;
  stats.height = image.height;
  stats.width = image.width;
  let pixelsArray = image.getPixelsArray()
  for (const pixel of pixelsArray) {
    let r = pixel[0]
    let g = pixel[1]
    let b = pixel[2]
    let height = getHeightFromRgb(r, g, b)
    if (height > stats.maxElevation) {
      stats.maxElevation = height;
    }
    if (height < stats.minElevation) {
      stats.minElevation = height;
    }

    decodedHeightArray.push(height)
  }

  return {decodedHeightArray, stats}
}


async function fileExists(dirHandle, fileName) {
  //Check if file exists
  try {
    await dirHandle.getFileHandle(fileName)
    console.log(fileName + '  file already exists -- using cached file')
    return true
  } catch (e) {
    if (e.name === "NotFoundError") {
      console.log(fileName + '  File not found try to download')
      return false
    }
  }
}

async function writeFileToDisk(writeDirHandle, fileName, imgArray) {

  let writeFileHandle = await writeDirHandle.getFileHandle(fileName, {create: true})
  let writable = await writeFileHandle.createWritable()
  await writable.write(imgArray)
  await writable.close();
}

async function readFileFromDisk(dirHandle, fileName) {
  let fileHandle = await dirHandle.getFileHandle(fileName)
  const file = await fileHandle.getFile();
  let imageArrayBuffer = await file.arrayBuffer()
  return imageArrayBuffer
}

function getHeightFromRgb(r, g, b) {
  return -10000 + ((r * 256 * 256 + g * 256 + b) * 0.1);
}


export default {
  loadImageFromArray,
  createHeightMapImage,
  convertImage,
  writeFileToDisk,
  getMapboxTerrainRgb,
  fileExists,
  loadWasm,
  getHeightFromRgb
}


// if (thirtytwoArray) {
//   // img.image = await Image.load(thirtytwoArray)
//   // img.blob = await img.image.toBlob()
//   console.log(thirtytwoFileName + '  file already exists -- using cached file')
// } else {
//   //Convert rbg to thirtytwo
//   img = await convertImage(rgbImage.width, rgbImage.height, decodedHeightArray, bitDepth)
//   // //write file to disk'
//   await writeFileToDisk(dirHandle, thirtytwoFileName, img.blob)
// }

// let statistics = getStatistics(decodedHeightArray)
// img.minElevation = statistics.minElevation
// img.maxElevation = statistics.maxElevation
  //
// //Store Buffer in db
// await set('preview_image', img, db)

// let stats = {}
// stats = {};
// stats.minHeight = Number.MAX_VALUE;
// stats.maxHeight = Number.MIN_VALUE;
// let h = img.height;
// let w = img.width;
//
// let height = -10000 + ((r * 256 * 256 + g * 256 + b) * 0.1);
// if (height > stats.maxHeight) {
//   stats.maxHeight = height;
// }
// if (height < stats.minHeight) {
//   stats.minHeight = height;
// }

// let elevation = decodedHeightArray.reduce(([min, max], val) => [Math.min(min, val), Math.max(max, val)], [
//   Number.POSITIVE_INFINITY,
//   Number.NEGATIVE_INFINITY,
// ]);
//
// statistics.minElevation = elevation[0]
// statistics.maxElevation = elevation[1]
// return statistics


// console.log('exists')
// console.log('exists')
// console.log(readFileHandle)
//let arrBuff = await readFileFromDisk(dirHandle, fileName)
//return arrBuff
