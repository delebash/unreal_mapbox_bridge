import {Image} from "image-js";

/**
 * Open a handle to an existing file on the local file system.
 *
 * @return {!Promise<FileSystemFileHandle>} Handle to the existing file.
 */
function getFileHandle() {
    // For Chrome 86 and later...
    if ('showOpenFilePicker' in window) {
        return window.showOpenFilePicker().then((handles) => handles[0]);
    }
}

/**
 * Open a handle to a directory on the local file system.
 *
 * @return {!Promise<FileSystemFileHandle>} Handle to the existing file.
 */
function getDirHandle() {
    // For Chrome 86 and later...
    if ('showDirectoryPicker' in window) {
        return window.showDirectoryPicker().then((handles) => handles);
    }
}

/**
 * Create a handle to a new (text) file on the local file system.
 *
 * @return {!Promise<FileSystemFileHandle>} Handle to the new file.
 */
function getNewFileHandle() {
    // For Chrome 86 and later...
    if ('showSaveFilePicker' in window) {
        const opts = {
            types: [{
                description: 'Text file',
                accept: {'text/plain': ['.txt']},
            }],
        };
        return window.showSaveFilePicker(opts);
    }
}

/**
 * Reads the raw text from a file.
 *
 * @param {File} file
 * @return {!Promise<string>} A promise that resolves to the parsed string.
 */
function readFile(file) {
    // If the new .text() reader is available, use it.
    if (file.text) {
        return file.text();
    }
}

/**
 * Writes the contents to disk.
 *
 * @param {FileSystemFileHandle} fileHandle File handle to write to.
 * @param {string} contents Contents to write.
 */
async function writeFile(fileHandle, contents) {
    // For Chrome 83 and later.
    // Create a FileSystemWritableFileStream to write to.
    const writable = await fileHandle.createWritable();
    // Write the contents of the file to the stream.
    await writable.write(contents);
    // Close the file and write the contents to disk.
    await writable.close();
}

/**
 * Verify the user has granted permission to read or write to the file, if
 * permission hasn't been granted, request permission.
 *
 * @param {FileSystemFileHandle} fileHandle File handle to check.
 * @param {boolean} withWrite True if write permission should be checked.
 * @return {boolean} True if the user has granted read/write permission.
 */
async function verifyPermission(dirHandle, withWrite) {
    const opts = {};
    if (withWrite) {
        opts.writable = true;
        // For Chrome 86 and later...
        opts.mode = 'readwrite';
    }
    // Check if we already have permission, if so, return true.
    if (await dirHandle.queryPermission(opts) === 'granted') {
        return true;
    }
    // Request permission to the file, if the user grants permission, return true.
    if (await dirHandle.requestPermission(opts) === 'granted') {
        return true;
    }
    // The user did nt grant permission, return false.
    return false;
}

async function writeFileToDisk(writeDirHandle, fileName, imgArray) {

    let writeFileHandle = await writeDirHandle.getFileHandle(fileName, {create: true})
    let writable = await writeFileHandle.createWritable()
    await writable.write(imgArray)
    await writable.close();
}

async function fileExists(dirHandle, fileName) {
    //Check if file exists
    try {
        await dirHandle.getFileHandle(fileName)
        // console.log(fileName + '  file already exists -- using cached file')
        return true
    } catch (e) {
        if (e.name === "NotFoundError") {
            // console.log(fileName + '  File not found try to download')
            return false
        }
        if (e.name === "NotAllowedError") {
            console.log('Please select directory to verify permissions')
            return false
        }
    }
}

function getHeightFromRgb(r, g, b) {

    return -10000 + ((r * 256 * 256 + g * 256 + b) * 0.1);

}

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

        // let heightStats = getHeightFromRgb(r, g, b, 1)
        let height = getHeightFromRgb(r, g, b)

        if (height > stats.maxElevation) {
            stats.maxElevation = height;
        }

        if (height < stats.minElevation) {
            stats.minElevation = height;
        }

        decodedHeightArray.push(height)
    }

    //Get center elevations range and add that to height values to set Unreal Landscape at sea level
    let median = getMedianArray(decodedHeightArray)
    let adjustedHeightArray = decodedHeightArray.map(x => x + median);


    // stats.unrealZscale = ((stats.maxElevation/512) * 100)
    // console.log(stats.unrealZscale)

    return {adjustedHeightArray, stats}
}

function getMedianArray(array) {


    const arr = array.filter(val => !!val);
    const sum = arr.reduce((sum, val) => (sum += val));
    const len = arr.length;


    const arrSort = arr.sort();
    const mid = Math.ceil(len / 2);

    const median = len % 2 == 0 ? (arrSort[mid] + arrSort[mid - 1]) / 2 : arrSort[mid - 1];

    return median
}

async function createHeightMapImage(rgbImage, bitDepth, colorModel) {

    let height_array_stats = await getHeightArrayStats(rgbImage)

    let image = await convertImage(height_array_stats.stats.width, height_array_stats.stats.height, height_array_stats.decodedHeightArray, bitDepth, colorModel)
    height_array_stats.image = image
    return height_array_stats
}

async function loadImageFromArray(imageArray) {
    let image = await Image.load(imageArray)
    return image
}

async function convertImage(width, height, imageArray, bitDepth, colorModel) {
    let newImage = new Image(width, height, imageArray, {kind: colorModel, bitDepth: bitDepth})
    return newImage
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

async function downloadTerrainRgb(mapbox_rgb_image_url) {
    //Fetch png tile from mapbox
    const response = await fetch(mapbox_rgb_image_url);
    let arrBuffer = response.arrayBuffer()
    return arrBuffer
}

async function readFileFromDisk(dirHandle, fileName) {
    let fileHandle = await dirHandle.getFileHandle(fileName)
    const file = await fileHandle.getFile();
    let imageArrayBuffer = await file.arrayBuffer()
    return imageArrayBuffer
}

export default {
    getDirHandle,
    verifyPermission,
    createHeightMapImage,
    convertImage,
    writeFileToDisk,
    getMapboxTerrainRgb,
    fileExists,
    getFileHandle,
    loadImageFromArray
}
