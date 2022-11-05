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

      <q-field class="q-pt-none q-mt-xs" dense label="Unreal Z-Scale" hint="Input into Unreal Landscape Z scale"
               stack-label>
        <template v-slot:control>
          <div class="text-weight-bold q-pt-sm self-center full-width no-outline" tabindex="0">{{
              this.tile_info.zscale
            }}
          </div>
        </template>
      </q-field>

      <q-item-label class="q-pt-none q-mt-xs"><b><u>Export Type:</u></b></q-item-label>
      <q-select
        class="q-mt-none q-pt-none"
        bg-color="blue-2"
        outlined
        filled
        dense
        v-model="exportType"
        :options="exportTyprOptions"
        option-disable="cannotSelect"
        :option-disable="(item) => item === null ? true : item.cannotSelect"
        @update:model-value="exportType_Change"
      />

      <q-item-label v-show="isExportOptions" class="q-pt-none q-mt-xs"><b><u>Export Options:</u></b></q-item-label>
      <q-option-group v-show="isExportOptions"
                      class="q-mt-none q-pt-none"
                      dense
                      inline
                      :options="exportOptions"
                      @update:model-value="exportOptionsModelChange"
                      type="checkbox"
                      v-model="exportOptionsModel"

      />

      <q-select v-show="isLandscape" dense class="q-pt-none q-mt-xs"
                label="Landscape Size"
                transition-show="scale"
                transition-hide="scale"
                hint="Unreal Recommended Sizes"
                outlined
                v-model="unrealLandscape"
                :options="landscapeSize"
      />


      <q-field v-show="isAlphaBrush" class="q-pt-none q-mt-xs" label="Brush Size"
      >
        <q-input class="q-pt-none q-mt-xs" filled v-model="alphaBrushHeight" label="Height"/>
        <q-input class="q-pt-none q-mt-xs" filled v-model="alphaBrushWidth" label="Width"/>
        <q-input
          ref="alphaBrushNameRef"
          filled
          v-model="alphaBrushName"
          label="Brush Name"
        />
      </q-field>


      <q-field v-show="isLandscape" class="q-pt-none q-mt-xs" dense label="Landscape Name (Optional)"
               hint="Enter Unique Landscape Name"
      >
        <q-input v-model="landscapeName"/>
      </q-field>

      <q-field v-show="isBlurRadius" class="q-pt-none q-mt-xs" label="Blur Radius"
      >
        <q-input class="q-pt-none q-mt-xs" filled v-model="blurRadius" label="Blur Radius"/>
      </q-field>


    </div>
  </div>


  <q-btn v-show="isDownload" @click="createSixteenHeightMap" ref="btnDownload" dense color="primary" no-caps
         label="Download HeightMap"/>


  <q-btn v-show="isSendToUnreal" @click="sendToUnreal" :disabled="isDisabled" dense color="green" class="q-ml-xs"
         no-caps
         label="Send To Unreal"/>


  <q-btn @click="copyExtents" :disabled="isDisabled" dense color="purple" class="q-ml-xs" no-caps
         label="Copy Bounds for Blender Osm"/>

  <q-btn @click="copyTileInfoString" :disabled="isDisabled" dense color="cyan" class="q-ml-xs" no-caps
         label="Copy Slippy Tile Info String"/>

  <q-btn @click="showBBInfo" dense color="orange" no-caps label="Show Bounding Box Info"/>

  <q-dialog v-model="bbinfoalert">
    <q-card>
      <q-card-section>
        <div class="text-h6"><u>Coordinates for Unreal LandscapeGen Plugin</u></div>

      </q-card-section>

      <q-card-section class="q-pt-none">

        <div class="text-h6">Zoom:</div>
        {{ tile_info.z }}
        <div class="text-h6">Mouse Point Lat/Lng:</div>
        Lat: {{ tile_info.pointLat }} Lng: {{ tile_info.pointLng }}

        <div class="text-h6"><u>Bounding Box Corners Lat/Lng:</u></div>

        <div class="text-h6">Top Left:</div>
        Lat: {{ tile_info.topLeft.lat }} Lng: {{ tile_info.topLeft.lng }}

        <div class="text-h6">Bottom Left:</div>
        Lat: {{ tile_info.bottomLeft.lat }} Lng: {{ tile_info.bottomLeft.lng }}

        <div class="text-h6">Top Right:</div>
        Lat: {{ tile_info.topRight.lat }} Lng: {{ tile_info.topRight.lng }}

        <div class="text-h6">Bottom Right:</div>
        Lat: {{ tile_info.bottomRight.lat }} Lng: {{ tile_info.bottomRight.lng }}

        <div class="text-h6">Lng/Lat Max/Min:</div>
        Lng/Lat-Min: {{ tile_info.bboxW }} , {{ tile_info.bboxS }}
        Lng/Lat-Max: {{ tile_info.bboxE }} , {{ tile_info.bboxN }}

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
      isDownload: ref(true),
      isLandscape: ref(true),
      isExportOptions: ref(true),
      isBlurRadius: ref(true),
      isSendToUnreal: ref(true),
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
      exportType: ref({label: 'Unreal Heightmap', value: 'Unreal Heightmap'}),
      landscapeName: ref(''),
      alphaBrushName: ref(''),
      alphaBrushHeight: ref(505),
      alphaBrushWidth: ref(505),
      unrealMapPath: ref(''),
      qt: $q,
      exportOptionsModel: ref(['zrange', 'combine_features']),
      alertMsg: ref(''),
      exportOptions: [
        {label: 'Zrange-sea level=0', value: 'zrange'},
        {label: 'Flip X', value: 'flipx'},
        {label: 'Flip y', value: 'flipy'},
        {label: 'Download Satellite', value: 'satellite'},
        {label: 'Download Geojson Features', value: 'features'},
        {label: 'Combine Unique Features', value: 'combine_features'},
      ],
      exportTyprOptions: [
        {label: 'Unreal Heightmap', value: 'Unreal Heightmap'},
        {label: 'Unreal Terrain Magic Plugin', value: 'Unreal Terrain Magic Plugin'},
        {label: 'Unreal Stamp Brush Plugin', value: 'Unreal Stamp Brush Plugin'},
        {label: 'Unreal Landmass Effect Brush Plugin -- Coming Soon', value: 'Unreal Landmass Effect Brush Plugin', cannotSelect:true},
        {label: 'None', value: 'none'},
        {label: 'Geojson Only', value: 'geojson_only'}
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
    showNotify(msg, color, position, icon, textColor) {
      this.qt.notify({
        message: msg,
        color: color,
        position: position,
        icon: icon,
        textColor: textColor
      })
    },
    copyTileInfoString() {
      if (this.tile_info) {
        navigator.permissions.query({name: "clipboard-write"}).then((result) => {
          if (result.state === "granted" || result.state === "prompt") {
            let tileInfoString = this.tile_info.x + ',' + this.tile_info.y + ',' + this.tile_info.z
            navigator.clipboard.writeText(tileInfoString).then(() => {
              this.showNotify('Tile info string copied   ' + tileInfoString, 'info', 'top', 'announcement', 'white')
              /* clipboard successfully set */
            }, () => {
              /* clipboard write failed */
            });
          }
        });
      } else {
        this.alertMsg = 'Please select a location on the map first.'
        this.alert = true
      }
    },
    copyExtents() {
      if (this.tile_info) {
        navigator.permissions.query({name: "clipboard-write"}).then((result) => {
          if (result.state === "granted" || result.state === "prompt") {

            let bboxCoords = this.tile_info.bboxW + ',' + this.tile_info.bboxS + ',' + this.tile_info.bboxE + ',' + this.tile_info.bboxN

            navigator.clipboard.writeText(bboxCoords).then(() => {
              this.showNotify('Bounding box coordinates copied   ' + bboxCoords, 'info', 'top', 'announcement', 'white')

              /* clipboard successfully set */
            }, () => {
              /* clipboard write failed */
            });
          }
        });
      } else {
        this.alertMsg = 'Please select a location on the map first.'
        this.alert = true
      }
    },
    adjustedZscale() {
      let zScale = this.getUnrealZScale(this.preview_image_info.maxElevation)

      // Use only positive range ( 0 to 255.992)
      //Use entire UE4 Z range (-256 to 255.992)

      if (this.exportOptionsModel.includes('zrange')) {
        this.tile_info.startZRange = ZrangeSeaLevel
        this.tile_info.zscale = (ZrangeSeaLevel / zScale).toFixed(3)
      } else {
        this.tile_info.startZRange = 0
        this.tile_info.zscale = zScale.toFixed(3)
      }
      return this.tile_info.zscale
    },
    exportOptionsModelChange(e) {
      this.exportOptionsModel = e
      this.adjustedZscale()
    },
    exportType_Change(e) {
      if (this.exportType.label === 'Unreal Heightmap' || this.exportType.label === "None") {
        this.isDownload = true
        this.isSendToUnreal = true
        this.isAlphaBrush = false
        this.isLandscape = true
        this.isExportOptions = true
        this.isBlurRadius = true
      } else if (this.exportType.label === "Unreal Stamp Brush Plugin" || this.exportType.label === "Unreal Landmass Effect Brush Plugin") {
        this.isDownload = false
        this.isSendToUnreal = true
        this.isAlphaBrush = true
        this.isLandscape = false
        this.isExportOptions = false
        this.isBlurRadius = true
      } else if (this.exportType.label === "Geojson Only") {
        this.isDownload = true
        this.isSendToUnreal = false
        this.isAlphaBrush = false
        this.isLandscape = false
        this.isExportOptions = false
        this.isBlurRadius = false
      } else if (this.exportType.label === "Unreal Terrain Magic Plugin") {
        this.isDownload = false
        this.isSendToUnreal = true
        this.isAlphaBrush = false
        this.isLandscape = false
        this.isExportOptions = false
        this.isBlurRadius = false
      }
    },
    showBBInfo() {
      if (this.tile_info) {
        this.bbinfoalert = true
      } else {
        this.bbinfoalert = false
        this.alertMsg = 'Please select a location on the map first.'
        this.alert = true
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

      let host = 'http://localhost:30010/', call = 'remote/object/call', data = {}, dataJson, result,
        bpPath, bluePrintName = 'Mapbox_BP', AlphaBrushPath,
        AlphaBrushTemplatePath, AlphaBrushTexturesPath, useTerrainMagic, HeightmapProperty

      //
      if (this.tile_info) {

        //Find name of Mapbox_BP in scene
        data = {
          "objectPath": "/Script/UnrealEd.Default__EditorActorSubsystem",
          "functionName": "GetAllLevelActors"
        }

        dataJson = await mapUtils.unrealRemoteControl(data, host + call)
       // console.log(dataJson.error)
        if (dataJson.error) {
        if (dataJson.error.message === "Failed to fetch") {
          this.alertMsg = "Cannot connect to Unreal server. Please make sure your project is open and Mapbox_BP is in the scene.  " +
            "Also make sure you launched the Map using the Select Map button as this starts the Unreal Web Server"
        }else{
          this.alertMsg = dataJson.error.message
        }
          this.alert = true
        } else {
          let objArray = await dataJson.response.json()
          for (let obj of objArray.ReturnValue) {
            result = obj.includes(bluePrintName)
            if (result === true) {
              bpPath = obj
            } else {
              bpPath = null
            }
          }

          if (bpPath) {
            //Mapbox_BP is in scene and we can continue

            if (this.exportType.label !== "Unreal Terrain Magic Plugin") {
              await this.createSixteenHeightMap()
            } else {
              useTerrainMagic = true
            }

            if (this.isAlphaBrush === true) {
              if (this.exportType.label === "Unreal Stamp Brush Plugin") {
                AlphaBrushPath = '/Game/Brushes/CustomBrushes/'
                AlphaBrushTemplatePath = '/Game/Brushes/PEAKS/Peak_10_brush.Peak_10_brush'
                AlphaBrushTexturesPath = 'Textures/'
                HeightmapProperty = 'HeightMap'
              }

              if (this.exportType.label === "Unreal Landmass Effect Brush Plugin") {
                AlphaBrushPath = '/Game/Editor/Landscape/LandmassEffectBrush/CustomBrushes/'
                AlphaBrushTemplatePath = '/Game/Editor/Landscape/LandmassEffectBrush/Effects/Variants/Map/HeightMapEffect.HeightMapEffect'
                AlphaBrushTexturesPath = 'Textures/'
                HeightmapProperty = '"Elevation"'
                HeightmapProperty = '"Heightmap (Greyscale / White is High)"'
              }

              data = {
                "objectPath": bpPath,
                "functionName": "MakeLandscapeStamp",
                "parameters": {
                  "AlphaBrushName": this.tile_info.alphaBrushFileName,
                  "AlphaBrushPath": AlphaBrushPath,
                  "AlphaBrushTemplatePath": AlphaBrushTemplatePath,
                  "AlphaBrushTexturesPath": AlphaBrushTexturesPath,
                  "HeightmapProperty": HeightmapProperty
                }
              }
            } else {
              this.unrealMapPath = await idbKeyval.get('mappath')
              this.tile_info.landscapeName = this.landscapeName
              let mapTileString = this.tile_info.x + "," + this.tile_info.y + "," + this.tile_info.z

              data = {
                "objectPath": bpPath,
                "functionName": "GenerateMapboxLandscape",
                "parameters": {
                  "LandscapeName": this.tile_info.landscapeName,
                  "LandscapeSize": this.tile_info.resolution.toString(),
                  "TileHeightmapFileName": this.tile_info.sixteenFileName,
                  "TileGeojsonFileName": this.tile_info.geoJsonFileName,
                  "TileInfoFileName": this.tile_info.tileInfoFileName,
                  "MapMiddleLngX": this.tile_info.center.lng,
                  "MapMiddleLatY": this.tile_info.center.lat,
                  "MapBtmRLng": this.tile_info.bottomRight.lng,
                  "MapBtmLLng": this.tile_info.bottomLeft.lng,
                  "MapTopLLat": this.tile_info.topLeft.lat,
                  "MapBtmLLat": this.tile_info.bottomLeft.lat,
                  "UseTerrainMagic": useTerrainMagic,
                  "SlippyMapTileString": mapTileString.trim()
                }
              }
            }

            //Call method on Mapbox_BP
            dataJson = await mapUtils.unrealRemoteControl(data, host + call)
            if (dataJson.error) {
              console.log(dataJson.error)
              this.alertMsg = dataJson.error.message
              this.alert = true
            } else {
              //Success
              console.log(await dataJson.response.json())
            }
          } else {
            this.alertMsg = 'Could not find Mapbox_BP in scene'
            this.alert = true
          }
        }
      } else {
        this.alertMsg = 'Please select a map location'
        this.alert = true
      }

      this.qt.loading.hide()

    },
    async unrealTileFeatures(combine) {
      let features = mapUtils.getFeaturesFromBB(this.map, this.tile_info, combine)
      //   let utmFeatures = mapUtils.convertGeoJsonCoordinatesToUTM(features)
      let strFeatures = JSON.stringify(features)

      let jsonTile_info = JSON.stringify(this.tile_info)
      await fileUtils.writeFileToDisk(this.dirHandle, this.tile_info.geoJsonFileName, strFeatures)
      await fileUtils.writeFileToDisk(this.dirHandle, this.tile_info.tileInfoFileName, jsonTile_info)
    },
    async createSixteenHeightMap() {

      if (this.tile_info) {
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
        //let mapbox_api_url = await idbKeyval.get('mapbox_api_url')
        this.tile_info.mapbox_satellite_image_url = mapbox_satellite_endpoint + `/${this.tile_info.z}/${this.tile_info.x}/${this.tile_info.y}@2x?access_token=` + this.access_token;
        this.tile_info.satelliteFileName = 'satellite' + '-' + this.tile_info.mapboxTileName + '-LandscapeSize-' + this.tile_info.resolution + '.jpg'

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


          // sixteen_img = await sixteen_img.rotate(-90)

          if (this.exportOptionsModel.includes('flipy')) {
            sixteen_img = await sixteen_img.flipY()
          }
          if (this.exportOptionsModel.includes('flipx')) {
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
          this.tile_info.exportTypeLabel = this.exportType.label


          // gdal_translate -of Gtiff -a_ullr LEFT_LON UPPER_LAT RIGHT_LON LOWER_LAT -a_srs EPSG_PROJ INPUT_PNG_FILE OUTPUT_GTIFF_FILE.
          this.tile_info.alphaBrushFileName = 'alphabrush' + '-' + this.tile_info.mapboxTileName + '-height-' + this.alphaBrushHeight + '-width-' + this.alphaBrushWidth

          if (this.exportOptionsModel.includes('features')) {
            let combine = false
            if (this.exportOptionsModel.includes('combine_features')) {
              combine = true
            }
            await this.unrealTileFeatures(combine)
          }

          switch (this.tile_info.exportTypeLabel) {

            case 'Unreal Heightmap':
              //Download heightmap
              translateOptions = [
                '-ot', 'UInt16',
                '-of', 'PNG',
                '-scale', this.img_min, this.img_max, this.tile_info.startZRange.toString(), this.tile_info.maxPngValue.toString(),
                '-outsize', this.tile_info.resampleSize, this.tile_info.resampleSize, '-r', this.tile_info.resizeMethod.toString()
              ];

              await this.createWorker(buff, this.tile_info.sixteenFileName, translateOptions, "png", "createHeightmap");

              if (this.exportOptionsModel.includes('satellite')) {
                //satellite image
                translateOptions = [
                  '-of', 'JPEG',
                  '-outsize', this.tile_info.resampleSize, this.tile_info.resampleSize, '-r', this.tile_info.resizeMethod
                ]
                let buff = await mapUtils.downloadTerrainRgb(this.tile_info.mapbox_satellite_image_url)
                await this.createWorker(buff, this.tile_info.satelliteFileName, translateOptions, "jpg", "createHeightmap");
              }
              this.qt.loading.hide()
              break;

            case 'Geojson Only':

              this.qt.loading.hide()
              break;

            case 'Unreal Stamp Brush Plugin':
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

            case 'Unreal Landmass Effect Brush Plugin':
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

            case 'None':
              await fileUtils.writeFileToDisk(this.dirHandle, this.tile_info.sixteenFileName, sixteen_img.toBuffer())
              this.qt.loading.hide()
              break;
          }
        } else {
          this.alertMsg = 'Please select a location on the map first.'
          this.alert = true
        }
      } else {
        this.alertMsg = 'Please select a location on the map first.'
        this.alert = true
      }
    }
  }
}


</script>


