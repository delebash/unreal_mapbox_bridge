<template>
  <div id="previewTitle" class="text-h6 bg-primary text-white">Preview Image</div>
  <q-img
      :src=url
      height=150px
  />
  <div class="row justify-start q-pa-none q-ma-none">
    <div style="width: 100%">
      <q-field dense class="text-weight-bolder q-pt-none q-mt-xs" label="Min/Max Elevation" stack-label>
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
      <q-field class="q-pt-none q-mt-xs" dense label="Tile width in meters" stack-label>
        <template v-slot:control>
          <div class="text-weight-bold q-pt-sm self-center full-width no-outline" tabindex="0">{{
              tileWidthInMeters
            }}
          </div>
        </template>
      </q-field>

      <q-field class="q-pt-none q-mt-xs" dense label="Unreal Z-Scale" hint="Input into Unreal Landscape Z scale"
               stack-label>
        <template v-slot:control>
          <div class="text-weight-bold q-pt-sm self-center full-width no-outline" tabindex="0">{{ zscale }}</div>
        </template>
      </q-field>
      <q-item-label class="q-pt-none q-mt-xs">Export Type:</q-item-label>
      <q-option-group
          class="q-mt-none q-pt-none"
          dense
          inline
          :options="exportOptions"
          type="radio"
          v-model="exportType"
      />

      <q-select dense class="q-pt-none q-mt-xs"
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
  <q-field class="q-pt-none q-mt-xs" dense label="Landscape Name" hint="Enter Unique Landscape Name"
  >
    <q-input v-model="landscapeName"/>
  </q-field>
  <!--  <div class="row justify-around q-pt-none q-mt-sm">-->
  <!--    <q-btn @click="showBBInfo" dense color="orange" no-caps label="Show Bounding Box Info"/>-->
  <!--  </div>-->
  <div class="row justify-betweenq-pt-none q-mt-xs">
    <q-btn @click="createSixteenHeightMap" dense color="primary" no-caps label="Download HeightMap"/>
    <q-btn @click="sendToUnreal" dense color="green" class="q-ml-xs" no-caps label="Send To Unreal"/>
  </div>

  <!--  <q-dialog v-model="bbinfoalert">-->
  <!--    <q-card>-->
  <!--      <q-card-section>-->
  <!--        <div class="text-h6"><u>Coordinates for Unreal LandscapeGen Plugin</u></div>-->

  <!--      </q-card-section>-->

  <!--      <q-card-section class="q-pt-none">-->

  <!--        <div class="text-h6">Max Latitude:</div>-->
  <!--        {{ tile_info.bbox[3] }}-->
  <!--        <div class="text-h6">Max Longitude:</div>-->
  <!--        {{ this.tile_info.bbox[0] }}-->
  <!--        <div class="text-h6"> Min Latitude:</div>-->
  <!--        {{ tile_info.bbox[1] }}-->
  <!--        <div class="text-h6"> Min Longitude:</div>-->
  <!--        {{ tile_info.bbox[2] }}-->
  <!--        <div class="text-h6">Zoom:</div>-->
  <!--        {{ tile_info.z }}-->


  <!--      </q-card-section>-->

  <!--      <q-card-actions align="right">-->
  <!--        <q-btn flat label="OK" color="primary" v-close-popup/>-->
  <!--      </q-card-actions>-->
  <!--    </q-card>-->
  <!--  </q-dialog>-->

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
import {Image} from "image-js";
import { useQuasar } from 'quasar'
let gdalWorker = new Worker('worker.js');
// let vips

export default {
  name: 'SideNav',
  setup() {
    const $q = useQuasar()
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
      bbinfoalert: ref(false),
      exportType: ref('unreal'),
      landscapeName: ref(''),
      qt : $q,
      exportOptions: [
        {label: 'Unreal', value: 'unreal'},
        {label: 'Normalize', value: 'normalize'},
        {label: 'None', value: 'none'}
      ]
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
    showBBInfo() {
      if (this.tile_info) {
        this.bbinfoalert = true
      } else {
        this.alert = true
      }
    },
    async sendToUnreal() {
      if (this.tile_info) {
        this.qt.loading.show()
        this.tile_info.landscapeName = this.landscapeName

        let listObjects = {
          "objectPath" : "/Script/EditorScriptingUtilities.Default__EditorLevelLibrary",
          "functionName":"GetAllLevelActors"
        }
        let bluePrintId
        let bluePrintName = "GenerateMapboxLandscape_BP"
        let objArray = await mapUtils.unrealRemoteControl(listObjects)
        for(let obj of objArray.ReturnValue){
          let result = obj.includes(bluePrintName)
          if(result === true){
            bluePrintId = obj.split('_').pop();
          }
        }
        bluePrintName = bluePrintName + '_' + bluePrintId
        let mapData = {
          "objectPath": "/Game/Maps/MapboxBrideExample.MapboxBrideExample:PersistentLevel." + bluePrintName,
          "functionName": "GenMapboxLandscape",
          "parameters": {
            "FileName": this.tile_info.sixteenFile.name + '-LandscapeSize-' + this.tile_info.resolution + '.png',
            "LandscapeName": this.tile_info.landscapeName
          }
        }

        let response = await mapUtils.unrealRemoteControl(mapData)
        console.log(response)
        this.qt.loading.hide()
      } else {
        this.alert = true
      }
    },
    async saveImage(imageBytes) {
      let dirHandle = await idbKeyval.get('dirHandle')
      let outputBlob = new Blob([imageBytes], {type: 'image/png'});
      await fileUtils.writeFileToDisk(dirHandle, this.tile_info.sixteenFile.name + '-LandscapeSize-' + this.tile_info.resolution + '.png', outputBlob)
      this.qt.loading.hide()
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
      await fileUtils.writeFileToDisk(dirHandle, this.tile_info.sixteenFile.name + '-LandscapeSize-' + this.tile_info.resolution + '.png', buff)
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
        this.qt.loading.show()
        let dirHandle = await idbKeyval.get('dirHandle')
        //Verify user has permission to rea/write from selected directory
        if (fileUtils.verifyPermission(dirHandle, true) === false) {
          console.error(`User did not grant permission to '${dirHandle.name}'`);
          return;
        }
        let bExists = fileUtils.fileExists(dirHandle, this.tile_info.thirtytwoFile)
        if (bExists) {
          let rgbImgBuff = await idbKeyval.get('rgb_image_buffer')
          let rgbImageArrayBuffer = await idbKeyval.get('rgbImageArrayBuffer')
          let rgb_image = await mapUtils.loadImageFromArray(rgbImgBuff)


          let sixteen_image_info = mapUtils.createHeightMapImage(rgb_image, 16, "GREY")
          let img = sixteen_image_info.image
          this.tile_info.resolution = this.unrealLandscape.value

          let min = parseInt(sixteen_image_info.minElevation).toString()
          let max = parseInt(sixteen_image_info.maxElevation).toString()

          let buff = await img.toBuffer()
          let resampleSize = this.unrealLandscape.value.toString()

          switch (this.exportType) {
            case 'unreal':
              let translateOptions = [
                '-ot', 'UInt16',
                '-of', 'PNG',
                '-scale', min, max, '32768', '65535',
                '-outsize', resampleSize, resampleSize, '-r', 'lanczos'
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
              break;

            case 'normalize':
              img = img.level()
              await fileUtils.writeFileToDisk(dirHandle, this.tile_info.sixteenFile.name + '-LandscapeSize-' + this.tile_info.resolution + '.png', img.toBuffer())
              break;

            case 'none':
              await fileUtils.writeFileToDisk(dirHandle, this.tile_info.sixteenFile.name + '-LandscapeSize-' + this.tile_info.resolution + '.png', img.toBuffer())
              break;
          }

          let features = mapUtils.getFeaturesFromBB(this.map, this.tile_info.polygon_bb)
          let strFeatures = JSON.stringify(features)
          let tile_info = JSON.stringify(this.tile_info)
          await fileUtils.writeFileToDisk(dirHandle, 'geojson-' + this.tile_info.mapbox_tile_name + '-' + this.tile_info.resolution + '.json', strFeatures)
          await fileUtils.writeFileToDisk(dirHandle, 'tile_info-' + this.tile_info.mapbox_tile_name + '-' + this.tile_info.resolution + '.json', tile_info)


          // if (this.unrealLandscape.value !== 512) {
          //   let image = vips.Image.newFromBuffer(buff);
          //   image = image.resize(this.unrealLandscape.value / image.width, {kernel: 'lanczos3'})
          //   const outBuffer = image.writeToBuffer('.PNG')
          //   buff = new Uint8Array(outBuffer);
          // }


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


