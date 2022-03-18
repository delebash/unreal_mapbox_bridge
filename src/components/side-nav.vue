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
          <div class="text-weight-bold q-pt-sm self-center full-width no-outline" tabindex="0">{{
              this.tile_info.minmax
            }}
          </div>
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
      <!--      <q-field class="q-pt-none q-mt-xs" dense label="Tile width in meters" stack-label>-->
      <!--        <template v-slot:control>-->
      <!--          <div class="text-weight-bold q-pt-sm self-center full-width no-outline" tabindex="0">{{-->
      <!--              this.tile_info.tileWidthInMeters-->
      <!--            }}-->
      <!--          </div>-->
      <!--        </template>-->
      <!--      </q-field>-->

      <q-field class="q-pt-none q-mt-xs" dense label="Unreal Z-Scale" hint="Input into Unreal Landscape Z scale"
               stack-label>
        <template v-slot:control>
          <div class="text-weight-bold q-pt-sm self-center full-width no-outline" tabindex="0">{{
              this.tile_info.zscale
            }}
          </div>
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
      <q-option-group
          class="q-mt-none q-pt-none"
          dense
          inline
          :options="otherOptions"
          @update:model-value="otherOptionsModelChange"
          type="checkbox"
          v-model="otherOptionsModel"

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
  <q-field class="q-pt-none q-mt-xs" dense label="Landscape Name (Optional)" hint="Enter Unique Landscape Name"
  >
    <q-input v-model="landscapeName"/>
  </q-field>

  <div class="row justify-around q-pt-none q-mt-sm">
    <q-btn @click="showBBInfo" dense color="orange" no-caps label="Show Bounding Box Info"/>
  </div>
  <div class="row justify-betweenq-pt-none q-mt-xs">
    <q-btn @click="createSixteenHeightMap" dense color="primary" no-caps label="Download HeightMap"/>
    <q-btn @click="sendToUnreal" :disabled="isDisabled" dense color="green" class="q-ml-xs" no-caps
           label="Send To Unreal"/>
  </div>

  <q-dialog v-model="bbinfoalert">
    <q-card>
      <q-card-section>
        <div class="text-h6"><u>Coordinates for Unreal LandscapeGen Plugin</u></div>

      </q-card-section>

      <q-card-section class="q-pt-none">

        <div class="text-h6">Max Latitude:</div>
        {{ tile_info.bbox[3] }}
        <div class="text-h6">Max Longitude:</div>
        {{ this.tile_info.bbox[0] }}
        <div class="text-h6"> Min Latitude:</div>
        {{ tile_info.bbox[1] }}
        <div class="text-h6"> Min Longitude:</div>
        {{ tile_info.bbox[2] }}
        <div class="text-h6">Zoom:</div>
        {{ tile_info.z }}
        <div class="text-h6">Mouse Point Lat:</div>
        {{ tile_info.pointLat }}
        <div class="text-h6">Mouse Point Lng:</div>
        {{ tile_info.pointLng }}
        <div class="text-h6">Mouse Point Northing:</div>
        {{ tile_info.pointNorthing }}
        <div class="text-h6">Mouse Point Easting:</div>
        {{ tile_info.pointEasting }}


        <div class="text-h6">Center Northing:</div>
        {{ tile_info.ctNorthing }}
        <div class="text-h6">Center Easting:</div>
        {{ tile_info.ctEasting }}

        <div class="text-h6">swNorthing:</div>
        {{ tile_info.swNorthing }}
        <div class="text-h6">swEasting:</div>
        {{ tile_info.swEasting }}

        <div class="text-h6">neNorthing:</div>
        {{ tile_info.neNorthing }}
        <div class="text-h6">neEasting:</div>
        {{ tile_info.neEasting }}

        <div class="text-h6">nwNorthing:</div>
        {{ tile_info.nwNorthing }}
        <div class="text-h6">nwEasting:</div>
        {{ tile_info.nwEasting }}

        <div class="text-h6">seNorthing:</div>
        {{ tile_info.seNorthing }}
        <div class="text-h6">seEasting:</div>
        {{ tile_info.seEasting }}

      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="alert">
    <q-card>
      <q-card-section>
        <div class="text-h6">Alert</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        {{ alertMsg }}
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
import {useQuasar} from 'quasar'


let gdalWorker = new Worker('gdalWorker.js');


export default {
  name: 'SideNav',
  setup() {
    const $q = useQuasar()
    return {
      alert: ref(false),
      isDisabled: ref(false),
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
      map: null,
      data: null,
      bbinfoalert: ref(false),
      exportType: ref('unreal'),
      landscapeName: ref(''),
      unrealMapPath: ref(''),
      qt: $q,
      otherOptionsModel: ref(['zrange']),
      alertMsg: ref(''),
      otherOptions: [
        {label: 'Zrange-sea level=0', value: 'zrange'},
      ],
      exportOptions: [
        {label: 'Unreal', value: 'unreal'},
        {label: 'Normalize', value: 'normalize'},
        {label: 'None', value: 'none'}
      ]
    }
  },
  async mounted() {
    //Send to unreal must be from local host
    // if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    //   this.isDisabled = false
    // }
    emitter.on('updatePreviewImage', (data) => {
      this.data = data
      this.updatePreviewImage()
    })
    gdalWorker.onmessage = async (evt) => {
      await this.saveImage(evt.data);
    }
  },
  methods: {
    adjustedZscale() {
      let zScale = this.getUnrealZScale(this.preview_image_info.maxElevation)

      // Use only positive range ( 0 to 255.992)
      //Use entire UE4 Z range (-256 to 255.992)
      let ZrangeSeaLevel = 32767

      if (this.otherOptionsModel.includes('zrange')) {
        this.tile_info.startZRange = ZrangeSeaLevel
        this.tile_info.zscale = (ZrangeSeaLevel / zScale).toFixed(3)
      } else {
        this.tile_info.startZRange = 0
        this.tile_info.zscale = zScale.toFixed(3)
      }
      return this.tile_info.zscale
    },
    otherOptionsModelChange(e) {
      this.otherOptionsModel = e
      this.adjustedZscale()
    },
    showBBInfo() {
      if (this.tile_info) {
        this.bbinfoalert = true
      } else {
        this.alert = true
      }
    },
    async sendToUnreal() {
      this.unrealMapPath = await idbKeyval.get('mappath')
      let fileName = this.tile_info.sixteenFileName

      let dirHandle = await idbKeyval.get('dirHandle')
      //Verify user has permission to rea/write from selected directory
      if (fileUtils.verifyPermission(dirHandle, true) === false) {
        console.error(`User did not grant permission to '${dirHandle.name}'`);
        return;
      }

      let bExists = await fileUtils.fileExists(dirHandle, fileName)
      let response
      if (bExists) {
        if (this.tile_info) {
          console.log('sending')
          this.qt.loading.show()
          this.tile_info.landscapeName = this.landscapeName


          let host = 'http://localhost:30010/'
          let search = 'remote/search/assets'
          let call = 'remote/object/call'
          let data = {}

          data = {
            "Query": "Mapbox_BP",
            "Filter": {
              "PackageNames": [],
              "ClassNames": [],
              "PackagePaths": [],
              "RecursiveClassesExclusionSet": [],
              "RecursivePaths": true,
              "RecursiveClasses": true
            }
          }
          response = await mapUtils.unrealRemoteControl(data, host + search)
          let bpPath = response.Assets[0].Path

          // data = {
          //    "objectPath" : "/Engine/UnrealEd/EditorSubsystem.Default__EditorActorSubsystem",
          //      "functionName":"GetAllLevelActors"
          //  }

          data = {
            "objectPath": bpPath,
            "functionName": "GenerateMapboxLandscape",
            "parameters": {
              "LandscapeName": this.tile_info.landscapeName,
              "LandscapeSize": this.tile_info.resolution.toString(),
              "TileHeightmapFileName": this.tile_info.sixteenFileName,
              "TileGeojsonFileName": this.tile_info.geoJsonFileName,
              "TileInfoFileName": this.tile_info.tileInfoFileName,
              "OriginLng": this.tile_info.originLng.toString(),
              "OriginLat": this.tile_info.originLat.toString(),
              "Epsg": this.tile_info.epsg.toString(),
              "OriginNorthing": this.tile_info.OriginNorthing.toString(),
              "OriginEasting": this.tile_info.OriginEasting.toString(),
              "PointNorthing": this.tile_info.pointNorthing.toString(),
              "PointEasting": this.tile_info.pointEasting.toString()
            }
          }

          response = await mapUtils.unrealRemoteControl(data, host + call)
          console.log(response)
          
          this.qt.loading.hide()
        } else {
          this.alert = true
        }
      } else {
        this.alertMsg = 'Please download heightmap first'
        this.alert = true
      }
    },
    async saveImage(imageBytes) {
      let dirHandle = await idbKeyval.get('dirHandle')
      let outputBlob = new Blob([imageBytes], {type: 'image/png'});
      await fileUtils.writeFileToDisk(dirHandle, this.tile_info.sixteenFileName, outputBlob)
      this.qt.loading.hide()
    },

    updateStats() {
      if (this.preview_image_info.maxElevation !== '') {
        this.tile_info.MaxElevation = this.preview_image_info.maxElevation
        this.tile_info.MinElevation = this.preview_image_info.minElevation
        this.tile_info.minmax = this.tile_info.MinElevation.toFixed(3) + ' / ' + this.tile_info.MaxElevation.toFixed(3)
        this.tile_info.elevation_range = (this.tile_info.MaxElevation - this.tile_info.MinElevation).toFixed(3)
        //  this.tile_info.tileWidthInMeters = this.tile_info.tileWidthInMeters.toFixed(3)
        //  this.tile_info.metersPerPixel = this.tile_info.metersPerPixel.toFixed(3)
        this.tile_info.zscale = this.adjustedZscale()
      } else {
        this.tile_info.minmax = ''
      }
    },
    getUnrealZScale(maxElevation) {
      let cm = (maxElevation * 100)
      let zscale = (cm * 0.001953125)
      return zscale
    },
    async writeFiles(buff) {
      let dirHandle = await idbKeyval.get('dirHandle')
      await fileUtils.writeFileToDisk(dirHandle, this.tile_info.sixteenFileName, buff)
      let features = mapUtils.getFeaturesFromBB(this.map, this.tile_info)

      let strFeatures = JSON.stringify(features)
      let tile_info = JSON.stringify(this.tile_info)
      await fileUtils.writeFileToDisk(dirHandle, strFeatures)
      await fileUtils.writeFileToDisk(dirHandle, this.tile_info.tileInfoFileName, tile_info)
    },
    async updatePreviewImage() {

      this.preview_image_info = await this.data.preview_image_info
      this.tile_info = this.data.tile_info
      this.map = this.data.map

      let blob = await this.preview_image_info.image.toBlob()
      const objectURL = URL.createObjectURL(blob)
      this.url = objectURL
      this.updateStats(this.tile_info)
    },
    async createSixteenHeightMap() {
      // utm zone calc   zone = int(longitude + 180.0) / 6 + 1
      this.tile_info.resolution = this.unrealLandscape.value

      this.tile_info.geoJsonFileName = 'geojson-' + this.tile_info.mapboxTileName + '.json'
      this.tile_info.tileInfoFileName = 'tile-info-' + this.tile_info.mapboxTileName + '.json'
      this.tile_info.sixteenFileName = 'sixteen' + '-' + this.tile_info.mapboxTileName + '-LandscapeSize-' + this.tile_info.resolution + '.png'


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
          //let rgbImageArrayBuffer = await idbKeyval.get('rgbImageArrayBuffer')
          let rgb_image = await mapUtils.loadImageFromArray(rgbImgBuff)

          let sixteen_image_info = mapUtils.createHeightMapImage(rgb_image, 16, "GREY")
          let img = sixteen_image_info.image
          // //Flip y for Unreal

          // img = img.flipY()
          //   img = img.flipX()
          //  img = img.rotate(-90)

          let min = parseInt(sixteen_image_info.minElevation).toString()
          let max = parseInt(sixteen_image_info.maxElevation).toString()

          let buff = await img.toBuffer()
          this.tile_info.resampleSize = this.unrealLandscape.value.toString()
          this.tile_info.resizeMethod = 'lanczos'

          // let totalX = 1 * this.tile_info.resampleSize * this.tile_info.metersPerPixel
          //   let totalY = 1 * this.tile_info.resampleSize * this.tile_info.metersPerPixel
          //  this.tile_info.xTransform = (this.tile_info.originLng + totalX).toFixed(4)
          //  this.tile_info.yTransform = (this.tile_info.originLat - totalY).toFixed(4)
          this.tile_info.exportType = this.exportType

          let convUtm = mapUtils.converLatLngTotUtm(this.tile_info.originLat, this.tile_info.originLng)
          this.tile_info.OriginNorthing = convUtm.northing
          this.tile_info.OriginEasting = convUtm.easting


          // gdal_translate -of Gtiff -a_ullr LEFT_LON UPPER_LAT RIGHT_LON LOWER_LAT -a_srs EPSG_PROJ INPUT_PNG_FILE OUTPUT_GTIFF_FILE.


          switch (this.tile_info.exportType) {
            case 'unreal':
              let translateOptions = [
                '-ot', 'UInt16',
                '-of', 'PNG',
                '-scale', min, max, this.tile_info.startZRange.toString(), this.tile_info.maxPngValue.toString(),
                '-outsize', this.tile_info.resampleSize, this.tile_info.resampleSize, '-r', this.tile_info.resizeMethod
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
              await fileUtils.writeFileToDisk(dirHandle, this.tile_info.sixteenFileName, img.toBuffer())
              this.qt.loading.hide()
              break;

            case 'none':
              await fileUtils.writeFileToDisk(dirHandle, this.tile_info.sixteenFileName, img.toBuffer())
              this.qt.loading.hide()
              break;
          }

          let features = mapUtils.getFeaturesFromBB(this.map, this.tile_info)
          let utmFeatures = mapUtils.convertGeoJsonCoordinatesToUTM(features)
          let strFeatures = JSON.stringify(utmFeatures)

          let jsonTile_info = JSON.stringify(this.tile_info)
          await fileUtils.writeFileToDisk(dirHandle, this.tile_info.geoJsonFileName, strFeatures)
          await fileUtils.writeFileToDisk(dirHandle, this.tile_info.tileInfoFileName, jsonTile_info)

        } else {
          this.alertMsg = 'Please download file first'
          this.alert = true
        }
      } else {
        this.alert = true
      }
    }
  }
}


</script>


