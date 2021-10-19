import {Image} from 'image-js'
import {createStore, get, set} from 'idb-keyval'

const db = createStore('unreal_mapbox', 'user_settings');

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
    fileExists
}
