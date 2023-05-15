'use strict'

import minBy from 'lodash/minBy';
import maxBy from 'lodash/maxBy';
import sortBy from 'lodash/sortBy';

// import Jimp from 'jimp/browser/lib/jimp';


export async function combineTilesJimp(tiles, tWidth, tHeight) {
  const offsetX = minBy(tiles, tile => tile.x).x
  const offsetY = minBy(tiles, tile => tile.y).y

  const makeRelative = (tile) => ({
    x: tile.x - offsetX,
    y: tile.y - offsetY,
    buffer: tile.buffer
  })

  const index = sortBy(tiles.map(makeRelative), ['y', 'x'])
  const cols = 1 + maxBy(index, tile => tile.x).x
  const rows = 1 + maxBy(index, tile => tile.y).y
  const w = tWidth * cols
  const h = tHeight * rows

  async function CompositeImg(image) {
    for (let data of index) {
      let buffer = Buffer.from(data.buffer)
      let y = data.y * tHeight
      let x = data.x * tWidth
      let newImage = await Jimp.read(buffer)
      image.composite(newImage, x, y)
    }
    return image
  }

  let image = await Jimp.read(Buffer.from(index[0].buffer))
  image.background(0xFFFFFFFF)
  image.resize(w, h);
  let compImage = await CompositeImg(image)

  let buffer = await compImage.getBufferAsync(Jimp.MIME_PNG);

  return buffer
}


