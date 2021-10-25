<template>
  <div id="previewTitle" class="text-h6 bg-primary text-white">Preview Image</div>
  <q-img
      :src=url
      height=240px
  />
  <div class="row justify-start q-pt-none">
    <div style="width: 100%">
      <q-field dense class="text-weight-bolder q-pt-xs" label="Min/Max Elevation" stack-label>
        <template v-slot:control>
          <div class="text-weight-bold q-pt-sm self-center full-width no-outline" tabindex="0">{{ minmax }}</div>
        </template>
      </q-field>
      <q-field dense label="Elevation Range" stack-label>
        <template v-slot:control>
          <div class="text-weight-bold q-pt-sm self-center full-width no-outline" tabindex="0">{{
              elevation_range
            }}
          </div>
        </template>
      </q-field>
      <q-field dense label="Tile width in meters" stack-label>
        <template v-slot:control>
          <div class="text-weight-bold q-pt-sm self-center full-width no-outline" tabindex="0">{{
              tileWidthInMeters
            }}
          </div>
        </template>
      </q-field>
      <q-field dense label="Pixel width in meters" stack-label>
        <template v-slot:control>
          <div class="text-weight-bold q-pt-sm self-center full-width no-outline" tabindex="0">{{
              metersPerPixel
            }}
          </div>
        </template>
      </q-field>
      <q-field dense label="Z Height" hint="Input into Unreal Landscape Z scale" stack-label>
        <template v-slot:control>
          <div class="text-weight-bold q-pt-sm self-center full-width no-outline" tabindex="0">{{ zscale }}</div>
        </template>
      </q-field>
      <q-select dense class="q-pt-md"
                label="Landscape Size"
                transition-show="scale"
                transition-hide="scale"
                hint="Unreal Recommended Sizes"
                outlined
                v-model="unrealLandscape"
                :options="landscapeSize"
      />
    </div>
  </div>
  <div class="row justify-center q-pt-lg">
    <q-btn @click="createSixteenHeightMap" dense color="primary" no-caps label="Download 16bit HeightMap"/>
  </div>
  <q-dialog v-model="alert">
    <q-card>
      <q-card-section>
        <div class="text-h6">Alert</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        Please select a tile to download first.
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>

import {ref} from 'vue'

import fileUtils from '../utilities/fileUtils/fs-helpers'
import emitter from "../utilities/emitter";
import idbKeyval from "../utilities/fileUtils/idb-keyval-iife";

const vips = await Vips();

export default {
  name: 'SideNav',
  setup() {
    return {
      alert: ref(false),
      unrealLandscape: ref({label: 505, value: 505}),
      landscapeSize: [
        {
          label: '8129x8129',
          value: 8129
        },
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
      dirHandle: ref(''),
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
      this.dirHandle = data.dirHandle

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
    async resampleImage(arrayBuff) {

    },
    async createSixteenHeightMap() {
      if (this.tile_info) {
        let dirHandle = await idbKeyval.get('dirHandle')
        //Verify user has permission to rea/write from selected directory
        if (await fileUtils.verifyPermission(dirHandle, true) === false) {
          console.error(`User did not grant permission to '${dirHandle.name}'`);
          return;
        }
        let bExists = fileUtils.fileExists(dirHandle, this.tile_info.thirtytwoFile)
        if (bExists) {
          let rgbImgBuff = await idbKeyval.get('rgb_image_buffer')
          let rgb_image = await fileUtils.loadImageFromArray(rgbImgBuff)
          let sixteen_image_info = await fileUtils.createHeightMapImage(rgb_image, 16, "GREY")
          let img = sixteen_image_info.image
          let arrayBuff = await img.toBuffer()
          let image = vips.Image.newFromBuffer(arrayBuff);
          image = image.resize(this.unrealLandscape.value / image.width, {kernel: 'lanczos3'})
          // image = image.sharpen({sigma: 2})
          const outBuffer = image.writeToBuffer('.PNG')
          const arr = new Uint8Array(outBuffer);
          await fileUtils.writeFileToDisk(dirHandle, this.tile_info.sixteenFile.name, arr)
        } else {
          this.alert = true
        }
      } else {
        this.alert = true
      }


      //      const files = [{ 'name': 'srcFile.jpg', 'content': rgbImgBuff }];
      // const command = ["convert", "srcFile.jpg", "-density", "512", "out.jpg"];
      //
      // let processedFiles = await Magick.Call(files, command);
      //
      // let firstOutputImage = processedFiles[0]
      // let buffer = firstOutputImage.buffer


      // let fetchedSourceImage = await fetch("terrain-rgb-9-82-180.png");
      // let arrayBuffer = await fetchedSourceImage.arrayBuffer();
      // let sourceBytes = new Uint8Array(arrayBuffer);
      // calling image magick with one source image, and command to rotate & resize image
      // const files = [{ 'name': 'srcFile.jpg', 'content': rgbImgBuff }];
      // const command = ["convert", "srcFile.jpg", "-density", "512", "out.jpg"];

      // let processedFiles = await Magick.Call(files, command);
      // console.log(processedFiles)
      // response can be multiple files (example split)
      // here we know we just have one
      // let firstOutputImage = processedFiles[0]
      // let buffer = firstOutputImage.buffer
      // console.log(buffer)
      //    strippedImage.src = URL.createObjectURL(firstOutputImage['blob'])
      // console.log("created image " + firstOutputImage['name'])
    }
  }
}
</script>
