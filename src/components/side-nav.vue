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
      <!--      <q-field dense label="Elevation Range" stack-label>-->
      <!--        <template v-slot:control>-->
      <!--          <div class="text-weight-bold q-pt-sm self-center full-width no-outline" tabindex="0">{{-->
      <!--              elevation_range-->
      <!--            }}-->
      <!--          </div>-->
      <!--        </template>-->
      <!--      </q-field>-->
      <q-field dense label="Tile width in meters" stack-label>
        <template v-slot:control>
          <div class="text-weight-bold q-pt-sm self-center full-width no-outline" tabindex="0">{{
              tileWidthInMeters
            }}
          </div>
        </template>
      </q-field>

      <q-field dense label="Unreal Z-Scale" hint="Input into Unreal Landscape Z scale" stack-label>
        <template v-slot:control>
          <div class="text-weight-bold q-pt-sm self-center full-width no-outline" tabindex="0">{{ zscale }}</div>
        </template>
      </q-field>
      <!--      <q-toggle-->
      <!--          dense-->
      <!--          v-model="levelImg"-->
      <!--          color="green"-->
      <!--          label="Normalize Image - Better for flat landscapes - need to reduce Z scale"-->
      <!--      />-->
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

import fileUtils from '../utilities/fs-helpers'
import emitter from "../utilities/emitter";
import idbKeyval from "../utilities/idb-keyval-iife";
import mapUtils from '../utilities/map-utils'
// import {Image} from "image-js";

let gdalWorker = new Worker('worker.js');
// let vips

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
          label: '512x512-Downloaded-Size',
          value: 512
        },
        {
          label: '505x505',
          value: 505
        }
      ],
      url: ref('thirtytwo-9-82-180.png'),
      tile_info: ref(''),
      dirHandle: ref(''),
      preview_image_info: ref(''),
      rgb_image: ref(''),
      minmax: ref(''),
      elevation_range: ref(''),
      tileWidthInMeters: ref(''),
      metersPerPixel: ref(''),
      zscale: ref(''),
      map: null,
      data: null,
      levelImg: ref(false)
    }
  },
  async mounted() {
    // vips = await Vips();

    emitter.on('updatePreviewImage', (data) => {
      this.data = data
      this.updatePreviewImage()
    })

    gdalWorker.onmessage = (evt) => {
      this.saveImage(evt.data);
    }
  },
  methods: {
    async saveImage(imageBytes) {
      let dirHandle = await idbKeyval.get('dirHandle')
      let outputBlob = new Blob([imageBytes], {type: 'image/png'});
      await fileUtils.writeFileToDisk(dirHandle, this.tile_info.sixteenFile.name + '-' + this.tile_info.resolution + '.png', outputBlob)
    },
    updateStats() {
      if (this.maxElevation !== '') {
        this.minmax = this.preview_image_info.minElevation.toFixed(3) + ' / ' + this.preview_image_info.maxElevation.toFixed(3)
        this.elevation_range = (this.preview_image_info.maxElevation - this.preview_image_info.minElevation).toFixed(3)
        this.tileWidthInMeters = this.tile_info.tileWidthInMeters.toFixed(3)
        this.metersPerPixel = this.tile_info.metersPerPixel.toFixed(3)
        this.zscale = this.getUnrealZScale(this.preview_image_info.maxElevation).toFixed(3)
      } else {
        this.minmax = ''
      }
    },
    getUnrealZScale(maxElevation) {
      let cm = (maxElevation * 100)
      let zscale = (cm * 0.001953125)
      return zscale
    },
    async writeFiles(buff) {
      let dirHandle = await idbKeyval.get('dirHandle')
      await fileUtils.writeFileToDisk(dirHandle, this.tile_info.sixteenFile.name + '-' + this.tile_info.resolution + '.png', buff)
      let features = mapUtils.getFeaturesFromBB(this.map, this.tile_info.polygon_bb)

      let strFeatures = JSON.stringify(features)
      let tile_info = JSON.stringify(this.tile_info)
      await fileUtils.writeFileToDisk(dirHandle, 'geojson-' + this.tile_info.mapbox_tile_name + '-' + this.tile_info.resolution + '.json', strFeatures)
      await fileUtils.writeFileToDisk(dirHandle, 'tile_info-' + this.tile_info.mapbox_tile_name + '-' + this.tile_info.resolution + '.json', tile_info)
    },

    async updatePreviewImage() {
      this.preview_image_info = await this.data.preview_image_info
      this.tile_info = this.data.tile_info
      this.map = this.data.map

      let blob = await this.preview_image_info.image.toBlob()
      const objectURL = URL.createObjectURL(blob)
      this.url = objectURL
      this.updateStats()
    },
    async createSixteenHeightMap() {
      if (this.tile_info) {
        let dirHandle = await idbKeyval.get('dirHandle')
        //Verify user has permission to rea/write from selected directory
        if (fileUtils.verifyPermission(dirHandle, true) === false) {
          console.error(`User did not grant permission to '${dirHandle.name}'`);
          return;
        }
        let bExists = fileUtils.fileExists(dirHandle, this.tile_info.thirtytwoFile)
        if (bExists) {
          let rgbImgBuff = await idbKeyval.get('rgb_image_buffer')
          let rgb_image = await mapUtils.loadImageFromArray(rgbImgBuff)


          let sixteen_image_info = mapUtils.createHeightMapImage(rgb_image, 16, "GREY")
          let img = sixteen_image_info.image
          this.tile_info.resolution = this.unrealLandscape.value

          let min = parseInt(sixteen_image_info.minElevation).toString()
          let max = parseInt(sixteen_image_info.maxElevation).toString()


          let buff = await img.toBuffer()
          let resample = this.unrealLandscape.value.toString()

          let translateOptions = [
            '-ot', 'UInt16',
            '-of', 'PNG',
            '-scale', min, max, '32768', '65535',
            '-outsize', resample, resample, '-r', 'lanczos'
          ];

          let file = new File([buff], "heightmap.png", {
            type: "image/png",
            lastModified: Date.now()
          });

          let list = new DataTransfer();
          list.items.add(file);
          let myFileList = list.files;
          let data = {}
          data.files = myFileList
          data.translateOptions = translateOptions
          gdalWorker.postMessage(data);

          let features = mapUtils.getFeaturesFromBB(this.map, this.tile_info.polygon_bb)

          let strFeatures = JSON.stringify(features)
          let tile_info = JSON.stringify(this.tile_info)
          await fileUtils.writeFileToDisk(dirHandle, 'geojson-' + this.tile_info.mapbox_tile_name + '-' + this.tile_info.resolution + '.json', strFeatures)
          await fileUtils.writeFileToDisk(dirHandle, 'tile_info-' + this.tile_info.mapbox_tile_name + '-' + this.tile_info.resolution + '.json', tile_info)


          // if (this.levelImg === true) {
          //   img = img.level()
          // }


          // if (this.unrealLandscape.value !== 512) {
          //   let image = vips.Image.newFromBuffer(buff);
          //   image = image.resize(this.unrealLandscape.value / image.width, {kernel: 'lanczos3'})
          //   const outBuffer = image.writeToBuffer('.PNG')
          //   buff = new Uint8Array(outBuffer);
          // }

          // await this.writeFiles(buffer)

          // let args = ['-ot', 'UInt16', '-scale', min, max, '32768', '65535']
          // let translateOptions = [
          //   '-ot', 'UInt16',
          //   '-of', 'PNG',
          //   '-scale', min, max, '32768', '65535'
          // ];
          //

          // imgFinal = await fileUtils.loadImageFromArray(arrayBuff)
          // let myblob = await imgFinal.toBlob()
          // let file = new File([myblob], "heightmap.png", {
          //   type: "image/png",
          //   lastModified: Date.now()
          // });
          // let list = new DataTransfer();
          // list.items.add(file);
          // let myFileList = list.files;
          // let data ={}
          // data.files = myFileList
          // data.translateOptions = translateOptions
          // gdalWorker.postMessage(data);


          //  await this.gdalScale(myFileList, translateOptions)

          // if (this.levelImg === true) {
          //   //    imgFinal = imgFinal.level({min:-255,max:255})
          //   imgFinal = imgFinal.level()
          //   arr = await imgFinal.toBuffer()
          // }

          // await fileUtils.writeFileToDisk(dirHandle, this.tile_info.sixteenFile.name + '-' + this.tile_info.resolution + '.png', buff)

        } else {
          this.alert = true
        }
      } else {
        this.alert = true
      }
    }
  }
}


// let coordinates = features.geometry.coordinates


// let points = []
// //Replace long/lat coordinates with projected
// let geofeatures = []
// let goodPoints = []
// let mypoints = []
// for (const myfeature of features) {
//   // console.log(myfeature)
//   // console.log(myfeature)
//   if (myfeature.geometry) {
//     //console.log(myfeature.geometry.type)
//     if (myfeature.geometry.type === 'LineString') {
//       // console.log(myfeature.geometry.type)
//       //  console.log(myfeature.geometry.coordinates)
//       for (const coordinate of myfeature.geometry.coordinates) {
//         mypoints = []
//      //   console.log(coordinate)
//         const point = this.map.project(coordinate);
//         console.log(point)
//         console.log(point.x)
//         console.log(point.y)
//         mypoints[0] = point.x
//         mypoints[1] = point.y
//        // console.log(mypoints)
//         goodPoints.push(mypoints)
//       }
//       myfeature.geometry.coordinates = goodPoints
//       goodPoints = []
//
//       geofeatures.push(myfeature)
//       // console.log(myfeature)
//     }
//   }
// }
</script>


