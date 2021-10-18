<template>
  <div id="previewTitle" class="text-h6 bg-primary text-white">Preview Image</div>

  <q-img
    :src=url
    height=300px
  />
  <div class="row justify-start q-pt-sm">
    <div style="width: 100%">
      <q-field class="text-weight-bolder" label="Min/Max Elevation" stack-label>
        <template v-slot:control>
          <div class="text-weight-bold q-pt-sm self-center full-width no-outline" tabindex="0">{{ minmax }}</div>
        </template>
      </q-field>
      <q-field label="Elevation Range" stack-label>
        <template v-slot:control>
          <div class="text-weight-bold q-pt-sm self-center full-width no-outline" tabindex="0">{{
              elevation_range
            }}
          </div>
        </template>
      </q-field>
      <q-field label="Tile width in meters" stack-label>
        <template v-slot:control>
          <div class="text-weight-bold q-pt-sm self-center full-width no-outline" tabindex="0">{{
              tileWidthInMeters
            }}
          </div>
        </template>
      </q-field>
      <q-field label="Pixel width in meters" stack-label>
        <template v-slot:control>
          <div class="text-weight-bold q-pt-sm self-center full-width no-outline" tabindex="0">{{
              metersPerPixel
            }}
          </div>
        </template>
      </q-field>
      <q-field label="Z Height" hint="Input into Unreal Landscape Z scale" stack-label>
        <template v-slot:control>
          <div class="text-weight-bold q-pt-sm self-center full-width no-outline" tabindex="0">{{ zscale }}</div>
        </template>
      </q-field>
      <q-select class="q-pt-md"
                label="Terrain Size"
                transition-show="scale"
                transition-hide="scale"
                hint="Unreal landscape size"
                outlined
                v-model="unrealLandscape"
                :options="landscapeSize"
      />
    </div>
  </div>
  <div class="row justify-center q-pt-lg">
    <q-btn @click="createSixteenHeightMap" color="primary" no-caps label="Download 16bit HeightMap"/>
  </div>

</template>

<script>

import {ref} from 'vue'
import {createStore, get} from 'idb-keyval'
import fileUtils from '../utilities/fileUtils'


const db = createStore('unreal_mapbox', 'user_settings');
import emitter from "../utilities/emitter";

import {Image} from 'image-js'

export default {
  name: 'SideNav',
  setup() {
    return {
      unrealLandscape: ref({label: 505, value: 505}),
      landscapeSize: [
        {
          label: '4033x4033',
          value: 4033
        },
        {
          label: '2017x2017',
          value: 2017
        },
        {
          label: '1009x1009',
          value: 1009
        },
        {
          label: '505x505',
          value: 505
        }
      ],
      url: ref('thirtytwo-9-82-180.png'),
      tile_info: ref(''),
      stats: ref(''),
      dir_handle: ref(''),
      preview_imag: ref(''),
      rgb_image: ref(''),
      maxElevation: ref(''),
      minElevation: ref(''),
      minmax: ref(''),
      elevation_range: ref(''),
      tileWidthInMeters: ref(''),
      metersPerPixel: ref(''),
      zscale: ref('')
    }
  },
  async mounted() {

    emitter.on('updatePreviewImage', (data) => {
      this.updatePreviewImage(data)
    })
  },

  methods: {

    updateStats() {
      if (this.maxElevation !== '') {
        //Rounding 3 decimal places
        this.minElevation = this.minElevation.toFixed(3)
        this.maxElevation = this.maxElevation.toFixed(3)
        //No Rouding
        // let decimalPlace = 3
        // this.minElevation = Math.trunc(this.minElevation * Math.pow(10, decimalPlace)) / Math.pow(10, decimalPlace)
        // this.maxElevation = Math.trunc(this.maxElevation * Math.pow(10, decimalPlace)) / Math.pow(10, decimalPlace)
        this.minmax = this.minElevation + ' / ' + this.maxElevation
        this.elevation_range = (this.maxElevation - this.minElevation).toFixed(3)
        this.tileWidthInMeters = this.tileWidthInMeters.toFixed(3)
        this.metersPerPixel = this.metersPerPixel.toFixed(3)
      } else {
        this.minmax = ''
      }
    },
    getUnrealZScale(maxElevation) {
      let cm = (maxElevation * 100)
      let zscale = (cm * 0.001953125)
      return zscale
    },
    async updatePreviewImage(data) {
      this.tile_info = data.tile_info
      this.stats = data.stats
      this.preview_image = data.preview_image
      this.dir_handle = data.dir_handle

      let blob = await this.preview_image.toBlob()
      const objectURL = URL.createObjectURL(blob)
      this.url = objectURL
      this.maxElevation = this.stats.maxElevation
      this.minElevation = this.stats.minElevation

      this.tileWidthInMeters = this.tile_info.tileWidthInMeters
      this.metersPerPixel = this.tile_info.metersPerPixel
      this.zscale = this.getUnrealZScale(this.maxElevation).toFixed(3)

      this.updateStats()
    },

    async createSixteenHeightMap() {
      let rgbImgBuff = await get('rgb_image_buffer', db)

      let rgb_image = await fileUtils.loadImageFromArray(rgbImgBuff)
      let sixteen_image_info = await fileUtils.createHeightMapImage(rgb_image, 16, "GREY")
      let img = sixteen_image_info.image
      let buff = await img.toBuffer()

      let fetchedSourceImage = await fetch("thirtytwo-9-82-180.png");
      let arrayBuffer = await fetchedSourceImage.arrayBuffer();
      let sourceBytes = new Uint8Array(arrayBuffer);




      // // calling image magick with one source image, and command to rotate & resize image
      // const files = [{ 'name': 'srcFile.jpg', 'content': sourceBytes }];
      // const command = ["convert", "srcFile.jpg", "-strip", "out.jpg"];
      // let processedFiles = await Magick.Call(files, command);
      // console.log(processedFiles)
      // // response can be multiple files (example split)
      // // here we know we just have one
      // let firstOutputImage = processedFiles[0]
      // //    strippedImage.src = URL.createObjectURL(firstOutputImage['blob'])
      // console.log("created image " + firstOutputImage['name'])
      // const dwolla = window.Magick;

      //  console.log(Magick.imageMagickVersion);
      //  let vips = Vips();
      // let image = vips.Image.newFromArray(buff)
      // console.log(image)
      // await fileUtils.writeFileToDisk(this.dir_handle, this.tile_info.sixteenFile.name, r)
      //  import("@silvia-odwyer/photon").then(photon => {
      //    // Module has now been imported.
      //    // All image processing logic w/ Photon goes here.
      //    // See sample code below.
      //  })

    }
  }
}


//load saved database info
// let dirHandle = await get('dir_handle', db)
// let tile_info = await get('tile_info', db)
// let fileExt = tile_info.z + "-" + tile_info.x + "-" + tile_info.y + '.png'
// let fileType = 'sixteen'
// let bitDepth = 16
// let sixteenFileName = fileType + "-" + fileExt
// let imgBlob

//Check if mapbox terrain rgb exists
// let rbgImageArray = await fileUtils.getMapboxTerrainRgb()
//Check if sixteen bit file exists
// let sixteenArray = await fileUtils.fileExists(dirHandle, sixteenFile.name)
// if (sixteenArray) {
//   imgBlob = new Blob([sixteenArray])
//   console.log('Sixteen file already exists using cached file')
// } else {
//   //Convert rbg to sixteen
//   let rgbImage = await Image.load(rbgImageArray)
//   let decodedHeightArray = await fileUtils.convertHeight(rgbImage)
//   let img = await fileUtils.convertImage(rgbImage.width, rgbImage.height, decodedHeightArray, bitDepth)
//   // //write file to disk'
//   await fileUtils.writeFileToDisk(dirHandle, sixteenFile.name, img.blob)
</script>
