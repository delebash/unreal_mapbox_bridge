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
        description: 'Text file', accept: {'text/plain': ['.txt']},
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
 * @param {FileSystemDirHandle} dirHandle Dir handle to check.
 * @param {boolean} withWrite True if write permission should be checked.
 * @return {boolean} True if permission granted.

 */
async function verifyPermission(dirHandle, withWrite) {
  const opts = {};
  if (withWrite) {
    opts.writable = true;
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

/**
 * Writes the contents to disk.
 *
 * @param {FileSystemDirHandle} dirHandle Dir handle to write to.
 * @param {string} fileName File name including extension.
 * @param {string, ArrayBuffer} contents Contents to write.
 */
async function writeFileToDisk(dirHandle, fileName, contents) {
  let writeFileHandle = await dirHandle.getFileHandle(fileName, {create: true})
  let writable = await writeFileHandle.createWritable()
  await writable.write(contents)
  await writable.close();
}

/**
 * Check if file exists on disk.
 *
 * @param {FileSystemDirHandle} dirHandle Dir handle to write to.
 * @param {string} fileName File name including extension.
 * @return {boolean} True if file exists.
 */
async function fileExists(dirHandle, fileName) {
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

/**
 * Writes the contents to disk.
 *
 * @param {FileSystemDirHandle} dirHandle Dir handle to write to.
 * @param {string} fileName File name including extension.
 * @return {ArrayBuffer} arrBuffer of image information.
 */

async function readFileFromDisk(dirHandle, fileName) {
  let fileHandle = await dirHandle.getFileHandle(fileName)
  const file = await fileHandle.getFile();
  const imageArrayBuffer = await file.arrayBuffer();
  return imageArrayBuffer
}

function checkFileApiSupport() {
  let bEnabled
  if ('showDirectoryPicker' in window) {
    bEnabled = true
  }else{
    bEnabled = false
  }
  // let bEnabled = true
  // try {
  //   if(window.showDirectoryPicker())
  //   const dirHandle = window.showDirectoryPicker()
  // } catch (e) {
  //   if (e.message === 'window.showDirectoryPicker is not a function') {
  //     bEnabled = false
  //   }
  // }
  return bEnabled
}

export default {
  getDirHandle, verifyPermission, writeFileToDisk, fileExists, getFileHandle, readFileFromDisk, checkFileApiSupport
}
