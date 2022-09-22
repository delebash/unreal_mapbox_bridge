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
        @update:model-value="exportType_Change"
        type="radio"
        v-model="exportType"
      />
      <q-option-group v-show="!isAlphaBrush"
                      class="q-mt-none q-pt-none"
                      dense
                      inline
                      :options="otherOptions"
                      @update:model-value="otherOptionsModelChange"
                      type="checkbox"
                      v-model="otherOptionsModel"

      />
      <q-select v-show="!isAlphaBrush" dense class="q-pt-none q-mt-xs"
                label="Landscape Size"
                transition-show="scale"
                transition-hide="scale"
                hint="Unreal Recommended Sizes"
                outlined
                v-model="unrealLandscape"
                :options="landscapeSize"
      />

    </div>
    <q-field v-show="isAlphaBrush" class="q-pt-none q-mt-xs" label="Alpha Brush Size"
    >
      <q-input class="q-pt-none q-mt-xs" filled v-model="alphaBrushHeight" label="Height"/>
      <q-input class="q-pt-none q-mt-xs" filled v-model="alphaBrushWidth" label="Width"/>
    </q-field>
    <q-field class="q-pt-none q-mt-xs" label="Blur Radius"
    >
      <q-input class="q-pt-none q-mt-xs" filled v-model="blurRadius" label="Blur Radius"/>
    </q-field>
    <q-field v-show="isAlphaBrush" class="q-pt-none q-mt-xs">
      <q-input
        ref="alphaBrushNameRef"
        filled
        v-model="alphaBrushName"
        label="Alpha Brush Name"
      />
    </q-field>
    <q-field v-show="!isAlphaBrush" class="q-pt-none q-mt-xs" dense label="Landscape Name (Optional)"
             hint="Enter Unique Landscape Name"
    >
      <q-input v-model="landscapeName"/>
    </q-field>
  </div>

  <q-btn @click="showBBInfo" dense color="orange" no-caps label="Show Bounding Box Info"/>

  <q-btn @click="createSixteenHeightMap" ref="btnDownload" dense color="primary" no-caps
         label="Download HeightMap"/>


  <q-btn @click="sendToUnreal" :disabled="isDisabled" dense color="green" class="q-ml-xs" no-caps
         label="Send To Unreal"/>


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
        <div class="text-h6">MaximumEasting:</div>
        {{ tile_info.MaximumEasting }}
        <div class="text-h6">MaximumNorthing:</div>
        {{ tile_info.MaximumNorthing }}
        <div class="text-h6">MinimumEasting:</div>
        {{ tile_info.MinimumEasting }}
        <div class="text-h6">MinimumNorthing:</div>
        {{ tile_info.MinimumNorthing }}
        <div class="text-h6">XInUU:</div>
        {{ tile_info.XInUU }}
        <div class="text-h6">YInUU:</div>
        {{ tile_info.YInUU }}

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
import mapboxgl from "mapbox-gl";


const gdalWorker = new Worker('gdalWorker.js');

// const vips = await Vips();

let ZrangeSeaLevel = 32767

export default {
  name: 'SideNav',
  setup() {
    const $q = useQuasar()
    return {
      alert: ref(false),
      isAlphaBrush: ref(false),
      blurRadius: ref(0),
      access_token: ref(''),
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
      save_fileName: ref(''),
      dirHandle: ref(''),
      preview_image_info: ref(''),
      rgb_image: ref(''),
      img_min: ref(''),
      img_max: ref(''),
      map: null,
      data: null,
      bbinfoalert: ref(false),
      exportType: ref('unreal'),
      landscapeName: ref(''),
      alphaBrushName: ref(''),
      alphaBrushHeight: ref(505),
      alphaBrushWidth: ref(505),
      unrealMapPath: ref(''),
      qt: $q,
      otherOptionsModel: ref(['zrange']),
      alertMsg: ref(''),
      otherOptions: [
        {label: 'Zrange-sea level=0', value: 'zrange'},
        {label: 'Flip X', value: 'flipx'},
        {label: 'Flip y', value: 'flipy'},
        {label: 'Download Satellite', value: 'satellite'},
        {label: 'Download Geojson Features', value: 'features'},
      ],
      exportOptions: [
        {label: 'Unreal Heightmap', value: 'unreal'},
        {label: 'Unreal Alpha Brush', value: 'unreal_alpha_brush'},
        {label: 'None', value: 'none'}
      ]
    }
  },
  async mounted() {

    emitter.on('updatePreviewImage', (data) => {
      this.data = data
      this.updatePreviewImage()
    })
  },
  methods: {
    adjustedZscale() {
      let zScale = this.getUnrealZScale(this.preview_image_info.maxElevation)

      // Use only positive range ( 0 to 255.992)
      //Use entire UE4 Z range (-256 to 255.992)

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
    exportType_Change(e) {

      if (e === "unreal_alpha_brush") {
        this.isAlphaBrush = true
        this.btnDownloadText = "Download Alpha Brush"

      } else {
        this.isAlphaBrush = false
        this.btnDownloadText = "Download "
      }
    },
    showBBInfo() {
      if (this.tile_info) {
        this.bbinfoalert = true
      } else {
        this.alert = false
      }
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

    async updatePreviewImage() {

      this.preview_image_info = await this.data.preview_image_info
      this.tile_info = this.data.tile_info
      this.map = this.data.map

      let blob = await this.preview_image_info.image.toBlob()
      const objectURL = URL.createObjectURL(blob)
      this.url = objectURL
      this.updateStats(this.tile_info)
    },
    async saveImage(imageBytes, save_fileName, file_type) {
      let dirHandle = await idbKeyval.get('dirHandle')
      let outputBlob = new Blob([imageBytes], {type: 'image/' + file_type});
      await fileUtils.writeFileToDisk(dirHandle, save_fileName, outputBlob)
    },

    async createWorker(buff, filename, translateOptions, file_type, process_type) {
      let that = this
      return new Promise(function (resolve) {
        let file = new File([buff], "temp." + file_type, {
          type: "image/" + file_type,
          lastModified: Date.now()
        });

        let list = new DataTransfer();
        list.items.add(file);
        let myFileList = list.files;
        let data = {}
        data.files = myFileList
        data.translateOptions = translateOptions
        gdalWorker.postMessage(data);
        gdalWorker.onmessage = async function (event) {
          if (process_type === "createHeightmap") {
            await that.saveImage(event.data, filename, file_type)
          }
          resolve(true);
        };
      });
    },
    async sendToUnreal() {
      let host = 'http://localhost:30010/'
      let search = 'remote/search/assets'
      let call = 'remote/object/call'
      let data = {}
      let response

      data = {
        "objectPath": "/Script/UnrealEd.Default__EditorActorSubsystem",
        "functionName": "GetAllLevelActors"
      }

      let bpPath = ''
      let bluePrintName = "Mapbox_BP"

      let objArray = await mapUtils.unrealRemoteControl(data, host + call)
      for (let obj of objArray.ReturnValue) {
        let result = obj.includes(bluePrintName)
        if (result === true) {
          bpPath = obj
        }
      }

      await this.createSixteenHeightMap()

      if (this.isAlphaBrush === true) {
        data = {
          "objectPath": bpPath,
          "functionName": "MakeLandscapeStamp",
          "parameters": {
            "AlphaBrushName": this.tile_info.alphaBrushFileName
          }
        }
        response = await mapUtils.unrealRemoteControl(data, host + call)
        this.qt.loading.hide()
      } else {
        this.unrealMapPath = await idbKeyval.get('mappath')
        this.tile_info.landscapeName = this.landscapeName
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
        this.qt.loading.hide()
      }
    },
    async unrealTileFeatures() {
      let features = mapUtils.getFeaturesFromBB(this.map, this.tile_info)
      let utmFeatures = mapUtils.convertGeoJsonCoordinatesToUTM(features)
      let strFeatures = JSON.stringify(utmFeatures)

      let jsonTile_info = JSON.stringify(this.tile_info)
      await fileUtils.writeFileToDisk(this.dirHandle, this.tile_info.geoJsonFileName, strFeatures)
      await fileUtils.writeFileToDisk(this.dirHandle, this.tile_info.tileInfoFileName, jsonTile_info)
    },
    async createSixteenHeightMap() {
      let translateOptions
      let buff

      this.tile_info.resolution = this.unrealLandscape.value
      mapboxgl.accessToken = await idbKeyval.get('access_token')
      this.access_token = mapboxgl.accessToken
      // utm zone calc   zone = int(longitude + 180.0) / 6 + 1


      this.tile_info.geoJsonFileName = 'geojson-' + this.tile_info.mapboxTileName + '.json'
      this.tile_info.tileInfoFileName = 'tile-info-' + this.tile_info.mapboxTileName + '.json'
      this.tile_info.sixteenFileName = 'sixteen' + '-' + this.tile_info.mapboxTileName + '-LandscapeSize-' + this.tile_info.resolution + '.png'

      let mapbox_satellite_endpoint = await idbKeyval.get('mapbox_satellite_endpoint')
      let mapbox_api_url = await idbKeyval.get('mapbox_api_url')
      this.tile_info.mapbox_satellite_image_url = mapbox_satellite_endpoint + `/${this.tile_info.z}/${this.tile_info.x}/${this.tile_info.y}@2x?access_token=` + this.access_token;
      this.tile_info.satelliteFileName = 'satellite' + '-' + this.tile_info.mapboxTileName + '-LandscapeSize-' + this.tile_info.resolution + '.jpg'

      if (this.tile_info) {
        this.qt.loading.show()
        this.dirHandle = await idbKeyval.get('dirHandle')
        //Verify user has permission to rea/write from selected directory
        if (await fileUtils.verifyPermission(this.dirHandle, true) === false) {
          console.error(`User did not grant permission to '${this.dirHandle.name}'`);
          return;
        }
        let bExists = fileUtils.fileExists(this.dirHandle, this.tile_info.thirtytwoFile)
        if (bExists) {

          let rgbImgBuff = await idbKeyval.get('rgb_image_buffer')
          let rgb_image = await mapUtils.loadImageFromArray(rgbImgBuff)
          let sixteen_image_info = mapUtils.createHeightMapImage(rgb_image, 16, "GREY")
          let sixteen_img = sixteen_image_info.image


          sixteen_img = await sixteen_img.rotate(-90)

          if (this.otherOptionsModel.includes('flipy')) {
            sixteen_img = await sixteen_img.flipY()
          }
          if (this.otherOptionsModel.includes('flipx')) {
            sixteen_img = await sixteen_img.flipX()
          }

          if (this.blurRadius >= 1) {
            sixteen_img = sixteen_img.blurFilter({radius: this.blurRadius})
            //  sixteen_img = sixteen_img.medianFilter({radius: this.blurRadius})
            //   sixteen_img = sixteen_img.gaussianFilter({radius: this.blurRadius})
          }
          buff = await sixteen_img.toBuffer()

          this.img_min = parseInt(sixteen_image_info.minElevation).toString()
          this.img_max = parseInt(sixteen_image_info.maxElevation).toString()

          this.tile_info.resampleSize = this.unrealLandscape.value.toString()
          this.tile_info.resizeMethod = 'lanczos'
          this.tile_info.exportType = this.exportType

          let convUtm = mapUtils.converLatLngTotUtm(this.tile_info.originLat, this.tile_info.originLng)
          this.tile_info.OriginNorthing = convUtm.northing
          this.tile_info.OriginEasting = convUtm.easting

          // gdal_translate -of Gtiff -a_ullr LEFT_LON UPPER_LAT RIGHT_LON LOWER_LAT -a_srs EPSG_PROJ INPUT_PNG_FILE OUTPUT_GTIFF_FILE.
          this.tile_info.alphaBrushFileName = 'alphabrush' + '-' + this.tile_info.mapboxTileName + '-height-' + this.alphaBrushHeight + '-width-' + this.alphaBrushWidth

          switch (this.tile_info.exportType) {
            case 'unreal':
              //Download heightmap
              translateOptions = [
                '-ot', 'UInt16',
                '-of', 'PNG',
                '-scale', this.img_min, this.img_max, this.tile_info.startZRange.toString(), this.tile_info.maxPngValue.toString(),
                '-outsize', this.tile_info.resampleSize, this.tile_info.resampleSize, '-r', this.tile_info.resizeMethod.toString()
              ];

              await this.createWorker(buff, this.tile_info.sixteenFileName, translateOptions, "png", "createHeightmap");

              if (this.otherOptionsModel.includes('satellite')) {
                //satellite image
                translateOptions = [
                  '-of', 'JPEG',
                  '-outsize', this.tile_info.resampleSize, this.tile_info.resampleSize, '-r', this.tile_info.resizeMethod
                ]
                let buff = await mapUtils.downloadTerrainRgb(this.tile_info.mapbox_satellite_image_url)
                await this.createWorker(buff, this.tile_info.satelliteFileName, translateOptions, "jpg", "createHeightmap");
              }

              if (this.otherOptionsModel.includes('features')) {
                await this.unrealTileFeatures()
              }

              this.qt.loading.hide()
              break;

            case 'unreal_alpha_brush':
              if (this.alphaBrushName.length > 0) {
                this.tile_info.alphaBrushFileName = this.alphaBrushName
              }
              //Download heightmap
              translateOptions = [
                '-ot', 'UInt16',
                '-of', 'PNG',
                '-scale', this.img_min, this.img_max, this.tile_info.startZRange.toString(), this.tile_info.maxPngValue.toString(),
                '-outsize', this.alphaBrushHeight.toString(), this.alphaBrushWidth.toString(), '-r', this.tile_info.resizeMethod
              ];

              await this.createWorker(buff, this.tile_info.alphaBrushFileName + '.png', translateOptions, "png", "createHeightmap");

              this.qt.loading.hide()
              break;

            case 'none':
              await fileUtils.writeFileToDisk(this.dirHandle, this.tile_info.sixteenFileName, sixteen_img.toBuffer())
              this.qt.loading.hide()
              break;
          }
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

// let img2 = alphaImag_img.median()
// alphaImag_img = img2.resize({width: 2017, height: 2017})
//

//

// //  img = img.blur(3)
//
//
//   let buff = await img.getBufferAsync(Jimp.MIME_PNG);


//   let im = vips.Image.newFromBuffer(buff)
// // Output size: 2017x2017
// im = im.median(3);


// let thumbnail = im.resize(2017 / im.width, {
//   vscale: 2017 / im.height,
//   kernel: vips.Kernel.lanczos3
// });

// let outBuffer = new Uint8Array(im.writeToBuffer('.png'))


// let alphaImage_Info = mapUtils.createHeightMapImage(buff, 32, "GREY")
// let alphaImag_img = alphaImage_Info.image
// let buff2 = await alphaImag_img.toBuffer()
// console.log(b)
// let jimp = Jimp.read(rgb_image);
//             Jimp.read(buff)
//                .then(image => {
//                  // Do stuff with the image.
//                })
//                .catch(err => {
//                  // Handle an exception.
//                });
//  const image =  Jimp.read(buff);
//let test =  new Jimp({ data: buff})
//  image.blur(5);


//img = await img.gaussian(10);
// img = await img.blur(20);
// console.log(buff)
// let radius = 16;
// let data = blur.blurImage(buff,512,512,radius)
// let t = mapUtils.loadImageFromArray(data)
// console.log(t)
// console.log(data)
// let test = await data.toBuffer()

//
//


// let grey = alphaImag_img
//   .resize({ width: this.alphaBrushWidth })
//   await fileUtils.writeFileToDisk(dirHandle, this.tile_info.alphaBrushFileName, alphaImag_img.toBuffer())

//  let img2 = alphaImag_img.median()
//   alphaImag_img = alphaImag_img.resize({width: 2017, height: 2017})
//   let buff = await alphaImag_img.toBuffer()

//

// //  img = img.blur(3)
//
//
//   let buff = await img.getBufferAsync(Jimp.MIME_PNG);


// let alphaImage_Info = mapUtils.createHeightMapImage(buff, 32, "GREY")
// let alphaImag_img = alphaImage_Info.image
// let buff2 = await alphaImag_img.toBuffer()
// console.log(b)
// let jimp = Jimp.read(rgb_image);
//             Jimp.read(buff)
//                .then(image => {
//                  // Do stuff with the image.
//                })
//                .catch(err => {
//                  // Handle an exception.
//                });
//  const image =  Jimp.read(buff);
//let test =  new Jimp({ data: buff})
// resize the image. Jimp.AUTO can be passed as one of the values.

//
// image.gaussian( r );              // Gaussian blur the image by r pixels (VERY slow)
// image.blur( r );
// img = await img.blur(20);
// console.log(buff)
// let radius = 16;
// let data = blur.blurImage(buff,512,512,radius)
// let t = mapUtils.loadImageFromArray(data)
// console.log(t)
// console.log(data)
// let test = await data.toBuffer()

//
//


// let grey = alphaImag_img
//   .resize({ width: this.alphaBrushWidth })
//   await fileUtils.writeFileToDisk(dirHandle, this.tile_info.alphaBrushFileName, alphaImag_img.toBuffer())


//image-js
// if (this.alphaBrushWidth !== '512') {
//   console.log("resize")
//   alphaImag_img = alphaImag_img.resize({
//     width: this.alphaBrushWidth,
//     height: this.alphaBrushHeight
//   })
// }
//
// if (this.blurRadius !== 0) {
//   // alphaImag_img = alphaImag_img.blurFilter({radius: this.blurRadius})
//   alphaImag_img = alphaImag_img.gaussianFilter({radius: this.blurRadius})
//   //alphaImag_img = alphaImag_img.medianFilter({radius: this.blurRadius})
// }
//


//VIPS

// let buffer = await alphaImag_img.toBuffer()
// im = vips.Image.newFromBuffer(buffer)
// Output size: 2017x2017

// im = im.resize(parseInt(this.alphaBrushWidth) / im.width, {
//   vscale: parseInt(this.alphaBrushHeight) / im.height,
//   kernel: vips.Kernel.lanczos3
// });
// im = im.histEqual()
//   if (this.blurRadius !== 0) {
//     console.log('blur')
//     im = im.gaussblur(this.blurRadius);
//   }

// buff = new Uint8Array(im.writeToBuffer('.png'))
//  await fileUtils.writeFileToDisk(dirHandle, "test.png", buff)

///JIMP
// let blob = await alphaImag_img.toBlob()
// let arryBuffer = await blob.arrayBuffer()
//
// img = await Jimp.read(arryBuffer)
// img = img.normalize()
// img = await img.resize(parseInt(this.alphaBrushHeight), parseInt(this.alphaBrushWidth))
// buff = await img.getBufferAsync(Jimp.MIME_PNG);
// await fileUtils.writeFileToDisk(dirHandle, "test.png", buff)

//
//
// if (this.blurRadius !== 0) {
//   //img =  img.blur(this.blurRadius);
//   img = img.deflateLevel(0)
//   //img = await img.gaussian(this.blurRadius);
// }


//    let rgbImageArrayBuffer = await idbKeyval.get('rgbImageArrayBuffer')

// let uint8View = new Uint8ClampedArray(rgbImageArrayBuffer);
//  new Uint8Array(data)
//  console.log(uint8View)
//
//      const blob = new Blob([rgbImageArrayBuffer]);
// console.log(blob)

// let img_data = await mapUtils.BlobToImageData(blob)
//    console.log(img_data)
//   let img_buff = img_data.data.buffer
// console.log(img_buff)
//     let buff = await mapUtils.convertImage2(uint8View)
//   console.log(buff)


//   const buffer = rgbImageArrayBuffer
// const ui8ca = new Uint8ClampedArray(buffer);
// const imageData = new ImageData(ui8ca, 100, 100);

// const canvas = document.getElementById('myCanvas');
// let ctx = document.createElement('canvas').getContext('2d');
// //ctx.putImageData(imageData, 0, 0);
//
// let pixels = new ImageData(
//   new Uint8ClampedArray( buffer * 4),
//   512,512
// );
// console.log(pixels)

// let arr = new Uint8ClampedArray(buffer);
// let buff = await mapUtils.convertImage2(arr)
// let buffer = new Buffer(rgbImageArrayBuffer.byteLength);
// let view = new Uint8ClampedArray(rgbImageArrayBuffer);
// for (let i = 0; i < buffer.length; ++i) {
//   buffer[i] = view[i];
// }
// let iData = new ImageData(new Uint8ClampedArray(buffer), 512, 512);
//
// console.log(iData)

// await fileUtils.writeFileToDisk(dirHandle, "test.png", buff)
//

//
//
// let width = 512, height = 512;
// let data = new ImageData(
//   new Uint8ClampedArray(4 * width * height),
//   720,
//   720
// );
//
//


//   let buffer = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);

// let array = new Uint8ClampedArray(buffer);

// let imagedata = new ImageData(rgbImageArrayBuffer, ctx.canvas.width, ctx.canvas.height);
// let buff = await mapUtils.convertImage2(imagedata.data)
//
//

//

// case 'normalize':
//   let sixteen_img = sixteen_img.level()
//   await fileUtils.writeFileToDisk(dirHandle, this.tile_info.sixteenFileName, sixteen_img.toBuffer())
//   this.qt.loading.hide()
//   break;

</script>


