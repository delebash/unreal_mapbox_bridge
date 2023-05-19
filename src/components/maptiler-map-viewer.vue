<style scoped>
#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}
</style>

<template>
  <div id="map">
    <pre id="features"></pre>

    <q-toolbar id="mb-tbar" class="bg-primary text-white q-pa-none q-ma-none">
      <q-btn color="info" label="Map Settings">
        <q-menu>
          <div class="row no-wrap q-pa-md">
            <div class="column">
              <u><b>Enable Layers</b></u>

              <q-option-group
                dense
                color="green"
                checked-icon="check"
                unchecked-icon="clear"
                :options="layer_type"
                type="toggle"
                v-model="layers"
                @update:model-value="changeLayers"
              />

            </div>
          </div>
        </q-menu>
      </q-btn>
      &nbsp; {{ ' Zoom: ' + this.zoom + ' ' + this.tileInfoString }}
    </q-toolbar>

  </div>
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
import {useQuasar} from "quasar";
import {ref} from "vue";
import '@maptiler/sdk/dist/maptiler-sdk.css';
import * as maptilersdk from '@maptiler/sdk';
import {GeocodingControl} from "@maptiler/geocoding-control/maptilersdk";
import "@maptiler/geocoding-control/style.css"
import idbKeyval from "src/utilities/idb-keyval-iife";

import mapUtils from "src/utilities/map-utils";
import fileUtils from "src/utilities/fs-helpers";
import emitter from "src/utilities/emitter";
import tib from "tiles-in-bbox";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import DrawAssistedRectangle from "@geostarters/mapbox-gl-draw-rectangle-assisted-mode";
import MapTilerGLButtonControl from "../maptiler-gl-button-control/index.js";
import {combineTilesJimp} from '../utilities/combine-tiles-jimp'

let draw
const STYLES_DRAW = [

  {
    "id": "gl-draw-line",
    "type": "line",
    "filter": ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#FF0000",
      "line-width": 2
    }
  },
  {
    "id": "gl-draw-polygon-fill",
    "type": "fill",
    "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
    "paint": {
      "fill-color": "#FF0000",
      "fill-outline-color": "#D20C0C",
      "fill-opacity": 0.1
    }
  },

  {
    "id": "gl-draw-polygon-stroke-active",
    "type": "line",
    "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#D20C0C",
      "line-width": 2
    }
  },

  {
    "id": "gl-draw-polygon-and-line-vertex-halo-active",
    "type": "circle",
    "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
    "paint": {
      "circle-radius": 5,
      "circle-color": "#FFF"
    }
  },

  {
    "id": "gl-draw-polygon-and-line-vertex-active",
    "type": "circle",
    "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
    "paint": {
      "circle-radius": 3,
      "circle-color": "#D20C0C",
    }
  },

  {
    "id": "gl-draw-line-static",
    "type": "line",
    "filter": ["all", ["==", "$type", "LineString"], ["==", "mode", "static"]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#FF0000",
      "line-width": 3
    }
  },
  {
    "id": "gl-draw-polygon-fill-static",
    "type": "fill",
    "filter": ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
    "paint": {
      "fill-color": "#ee0508",

      "fill-opacity": 0.8
    }
  },
  {
    "id": "gl-draw-polygon-stroke-static",
    "type": "line",
    "filter": ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#c40b0b",

      "line-width": 2
    }
  }
];
export default {
  name: 'maptiler-map-viewer',
  setup() {
    const $q = useQuasar()
    return {
      alert: ref(false),
      alertMsg: ref(''),
      tileInfoString: ref(''),
      dirHandle: ref(''),
      qt: $q,
      map: ref(null),
      maptiler_style_url: ref(''),
      maptiler_access_token: ref(''),
      maptiler_rgb_image_url: ref(''),
      maptiler_raster_png_dem: ref(''),
      maptiler_api_url: ref(''),
      satellite_endpoint: ref(''),
      satellite_image_url: ref(''),
      rasterFromStyle: ref(false),
      zoom: ref(''),
      lng: ref(''),
      lat: ref(''),
      drawmode: ref('simple_select'),
      layers: ref(['hillshading', 'bounding_box']),
      layer_type: [
        {
          label: 'Hillshade',
          value: 'hillshading'
        },
        {
          label: 'Bounding Box',
          value: 'bounding_box'
        },
        {
          label: 'Satellite',
          value: 'satellite'
        }
      ],
    }
  },
  mounted() {
  },
  methods: {
    async changeLayers(layers) {
      for (const layertype of this.layer_type) {
        if (layers.includes(layertype.value)) {
          this.map.setLayoutProperty(
            layertype.value,
            'visibility',
            'visible'
          )
        } else {
          this.map.setLayoutProperty(
            layertype.value,
            'visibility',
            'none'
          )
        }
      }
    },
    async loadMapSourcesLayers(map) {
      map.addSource("maptiler_terrain_dem", {
        "type": "raster-dem",
        "url": this.maptiler_raster_png_dem + 'tiles.json'
      });

      // Hillshade
      map.addLayer({
        "id": "hillshading",
        "source": "maptiler_terrain_dem",
        "type": "hillshade"
      });

      map.addSource('bounding_box_source', {
        type: 'geojson',
        data: {
          'type': 'Feature',
          'geometry': {
            'type': 'Polygon',
            'coordinates': [[[0, 0],
              [0, 1],
              [1, 1],
              [1, 0],
              [0, 0]]]
          }
        }
      });

      map.addLayer({
        id: 'bounding_box',
        type: 'fill',
        source: 'bounding_box_source',
        paint: {
          'fill-color': '#008888',
          'fill-opacity': 0
        }
      })

      map.addSource('satellite', {
        'type': 'raster',
        'url': this.maptiler_api_url + '/tiles/satellite/tiles.json',
        'tileSize': 512,
      });

      map.addLayer({
        id: 'satellite',
        source: 'satellite',
        type: "raster",
        'layout': {
          'visibility': 'none'
        }
      });
    },
    changeDrawMode(e) {
      let btnTile = document.getElementsByClassName("mapbox-gl-draw_polygon")[0]
      let btnStitchTiles = document.getElementsByClassName("mapbox-gl-draw_line")[0]
      let btnClicked = e.target

      if (btnClicked.title === "Select single tile") {
        btnStitchTiles.style.backgroundColor = "white"
        btnTile.style.backgroundColor = "green"
        draw.deleteAll()
        draw.changeMode('simple_select');
        this.drawmode = "simple_select"
      } else if (btnClicked.title === "Draw Rectangle to select multiple tiles") {
        btnStitchTiles.style.backgroundColor = "green"
        btnTile.style.backgroundColor = "white"
        draw.deleteAll()
        draw.changeMode('draw_assisted_rectangle');
        this.drawmode = "draw_assisted_rectangle"
        this.map.setPaintProperty('bounding_box', 'fill-opacity', 0);
      }
      idbKeyval.set('drawmode', this.drawmode)
      console.log(this.drawmode)
    },
    resizeMap() {
      //Fixes size of map when drawer is closed
      this.map.resize()
    },
    updateBBox(bbRectangle) {
      let coords = bbRectangle.features[0].geometry.coordinates[0]
      let minlng, minlat, maxlng, maxlt
      minlng = coords[3][0]
      minlat = coords[3][1]
      maxlng = coords[1][0]
      maxlt = coords[1][1]
      let bbox = [minlng, minlat, maxlng, maxlt]
      let tile_info = mapUtils.getTileInfo(0, 0, true, 0, 0, 0, bbox);
      idbKeyval.set('tile_info', tile_info)
    },
    async setBoundingBox(map) {

      let tile_info = mapUtils.getTileInfo(this.lng, this.lat, false, 0, 0, this.zoom);

      this.tileInfoString = 'Slippy Tile Info String: ' + tile_info.x + ',' + tile_info.y + ',' + tile_info.z + ' Bounding Box sides in KM: ' + (tile_info.distance)
      map.getSource('bounding_box_source').setData(tile_info.polygon_bb);
      map.setPaintProperty('bounding_box', 'fill-opacity', 0.45);
      map.fitBounds(tile_info.bbox, {linear: true})
      idbKeyval.set('tile_info', tile_info)
    },
    async loadMapTilerMap() {
      this.maptiler_access_token = await idbKeyval.get('maptiler_access_token')
      this.dirHandle = await idbKeyval.get('dirHandle')
      this.maptiler_style_url = await idbKeyval.get('maptiler_style_url')
      this.maptiler_api_url = await idbKeyval.get('maptiler_api_url')
      this.maptiler_raster_png_dem = await idbKeyval.get('maptiler_raster_png_dem')
      this.dirHandle = await idbKeyval.get('dirHandle')

      maptilersdk.config.apiKey = this.maptiler_access_token
      let that = this
      let map = new maptilersdk.Map({
        container: 'map',
        trackResize: true,
        antialias: true,
        style: this.maptiler_style_url,
        center: [-121.7598, 46.8760], //Mt. Rainier
        zoom: 9,
        maxZoom: 12,
        doubleClickZoom: false,
        terrainControl: true,
        fullscreenControl: true,
        failIfMajorPerformance: true
      });

      this.map = map
      this.map.doubleClickZoom.disable()
      //Add controls
      const gc = new GeocodingControl({
        apiKey: maptilersdk.config.apiKey,
        class: 'geocoder',
        showResultsWhileTyping: true,
        placeholder: 'Try: Lng , Lat or Name',

      });
      map.addControl(gc, 'top-right');

      //Draw
      draw = new MapboxDraw({
        modes: {
          ...MapboxDraw.modes,
          draw_assisted_rectangle: DrawAssistedRectangle
        },
        displayControlsDefault: false,
        controls: {},
        userProperties: true,
        styles: STYLES_DRAW
      });
      map.addControl(draw);

      //Add simple select for single tile
      const tile_select = new MapTilerGLButtonControl({
        className: "mapbox-gl-draw_polygon",
        title: "Select single tile",
        eventHandler: that.changeDrawMode
      });

      map.addControl(tile_select);

      const rectangle = new MapTilerGLButtonControl({
        className: "mapbox-gl-draw_line",
        title: "Draw Rectangle to select multiple tiles",
        eventHandler: that.changeDrawMode
      });
      map.addControl(rectangle);

      map.on('load', function () {
        that.loadMapSourcesLayers(map)
        let btnTile = document.getElementsByClassName("mapbox-gl-draw_polygon")[0]
        btnTile.style.backgroundColor = "green"
        draw.changeMode('simple_select');
        this.drawmode = "simple_select"
      });

      map.on('click', async function (e) {
        if (that.drawmode === "simple_select") {
          that.lng = e.lngLat.lng
          that.lat = e.lngLat.lat
          that.zoom = Math.floor(map.getZoom());
          await that.setBoundingBox(map, that.zoom)
        }
      })
      map.on('zoomend', async function () {
        that.zoom = Math.floor(map.getZoom());
        //   await that.setBoundingBox(map,that.zoom)
      });

      // map.on('wheel', () => {
      //
      // });

      map.on('error', e => {
        console.error(e);
      });
      map.on('draw.create', function (e) {
        console.log('draw mode create ' + e.type)
        that.updateBBox(e)
      });

      map.on('draw.update', function (e) {
        console.log('draw mode update ' + e.type)
        that.updateBBox(e)
      });
      map.on('draw.selectionchange', function (e) {
        console.log('draw mode selectionchange ' + e.type)
      })
      map.on('draw.delete', function (e) {
        console.log('draw mode delete ' + e.type)
      })

      map.on("draw.modechange", (e) => {
        console.log('draw mode CHANGE ' + e.mode)
      });
      map.on('dblclick', async function (e) {

        let dirHandle = await idbKeyval.get('dirHandle')

        //Verify user has permission to rea/write from selected directory
        if (await fileUtils.verifyPermission(dirHandle, true) === false) {
          console.error(`User did not grant permission to '${dirHandle.name}'`);
          return;
        }

        let tile_info = await idbKeyval.get('tile_info')
        let previewImageInfo = {}
        let updateStats = true
        that.tileInfoString = 'Slippy Tile Info String: ' + tile_info.x + ',' + tile_info.y + ',' + tile_info.z + ' Bounding Box sides in KM: ' + (tile_info.distance)
        let exportType = await idbKeyval.get('exportType')
        if (that.drawmode === "simple_select") {
          that.qt.loading.show()

          if (exportType.label === 'Image of map only') {
            //Get picture of map
            //string.replace('textToReplace', '');
            updateStats = false
            let url = that.maptiler_style_url.replace('style.json', '')
            let map_image_url = url + `${tile_info.z}/${tile_info.x}/${tile_info.y}.png?key=` + that.maptiler_access_token;
            let map_image = await mapUtils.getMapboxTerrainRgb(map_image_url)
            let map_buff = await map_image.toBuffer()
            idbKeyval.set('map_image_buffer', map_buff)
            await fileUtils.writeFileToDisk(dirHandle, tile_info.mapFileName, map_buff)
            previewImageInfo.image = map_image
          } else {
            //Get terrain rgb from selected tile
            that.maptiler_rgb_image_url = that.maptiler_raster_png_dem + `${tile_info.z}/${tile_info.x}/${tile_info.y}.webp?key=` + that.maptiler_access_token;

            let rgb_image = await mapUtils.getMapboxTerrainRgb(that.maptiler_rgb_image_url)
            let rgb_buff = await rgb_image.toBuffer()
            await idbKeyval.set('rgb_image_buffer', rgb_buff)
            await fileUtils.writeFileToDisk(dirHandle, tile_info.rgbFileName, rgb_buff)

            //Create preview imamge
            previewImageInfo = mapUtils.createHeightMapImage(rgb_image, 32, "GREY")

            let bFileExists = await fileUtils.fileExists(dirHandle, tile_info.thirtyTwoFileName)
            //Note file does not have to be written to disk in order to update preview image
            if (bFileExists === false) {
              let buff = await previewImageInfo.image.toBuffer()
              await fileUtils.writeFileToDisk(dirHandle, tile_info.thirtyTwoFileName, buff)
            }
          }
          emitter.emit('updatePreviewImage', {
            dir_handle: dirHandle,
            tile_info: tile_info,
            preview_image_info: previewImageInfo,
            map: map,
            updateStats: updateStats
          })
          that.qt.loading.hide()
        } else if (that.drawmode === "draw_assisted_rectangle") {
          that.qt.loading.show()
          tile_info.z = Math.floor(map.getZoom())
          idbKeyval.set('tile_info', tile_info)


          let exportOptionsModel = await idbKeyval.get('exportOptionsModel')
          // let backendServer = await idbKeyval.get('backendServer')
          let saveStitchingFiles = await idbKeyval.get('saveStitchingFiles')
          let z = Math.floor(map.getZoom());

          let bboxTiles = {
            left: tile_info.bbox[0],
            bottom: tile_info.bbox[1],
            right: tile_info.bbox[2],
            top: tile_info.bbox[3]
          }

          let tiles = tib.tilesInBbox(bboxTiles, z)
          let filesArray = []
          let mapArray = []
          let satArray = []

          try {
            if (exportType !== 'Image of map only') {
              for (let tile of tiles) {
                let fileInfo = {}
                tile_info = mapUtils.getTileInfo(0, 0, true, tile.x, tile.y, tile.z, tile_info.bbox);
                that.tileInfoString = 'Slippy Tile Info String: ' + tile_info.x + ',' + tile_info.y + ',' + tile_info.z + ' Bounding Box sides in KM: ' + (tile_info.distance)
                that.maptiler_rgb_image_url = that.maptiler_raster_png_dem + `${tile_info.z}/${tile_info.x}/${tile_info.y}.webp?key=` + that.maptiler_access_token;

                //Get terrain rgb from selected tile
                let rgb_image = await mapUtils.getMapboxTerrainRgb(that.maptiler_rgb_image_url)
                let rgb_buff = await rgb_image.toBuffer()

                if (saveStitchingFiles === true) {
                  await fileUtils.writeFileToDisk(dirHandle, tile_info.rgbFileName, rgb_buff)
                }

                fileInfo.x = tile_info.x
                fileInfo.y = tile_info.y
                fileInfo.buffer = rgb_buff
                filesArray.push(fileInfo)

                if (exportOptionsModel.includes('satellite')) {
                  that.satellite_endpoint = await idbKeyval.get('maptiler_satellite_endpoint')
                  that.satellite_image_url = that.satellite_endpoint + `/${tile_info.z}/${tile_info.x}/${tile_info.y}.jpg?key=` + that.maptiler_access_token;
                  let sat_img = await mapUtils.getMapboxTerrainRgb(that.satellite_image_url)
                  let sat_buff = await sat_img.toBuffer()

                  fileInfo = {}

                  fileInfo.x = tile_info.x
                  fileInfo.y = tile_info.y
                  fileInfo.buffer = sat_buff
                  satArray.push(fileInfo)
                }
              }

              idbKeyval.set('tile_info', tile_info)

              const size = 512
              let imageBuffer = await combineTilesJimp(filesArray, size, size)
              await idbKeyval.set('rgb_image_buffer', imageBuffer)
              await fileUtils.writeFileToDisk(dirHandle, tile_info.rgbFileName, imageBuffer)


              if (exportOptionsModel.includes('satellite')) {
                let imageBuffer = await combineTilesJimp(satArray, size, size)
                idbKeyval.set('sat_image_buffer', imageBuffer)
                await fileUtils.writeFileToDisk(dirHandle, tile_info.satelliteFileName, imageBuffer)
              }

              //Create preview imamge
              let rgb_buff = await idbKeyval.get('rgb_image_buffer')
              let rgb_image = await mapUtils.loadImageFromArray(rgb_buff)

              let previewImageInfo = mapUtils.createHeightMapImage(rgb_image, 32, "GREY")

              let bFileExists = await fileUtils.fileExists(dirHandle, tile_info.thirtyTwoFileName)
              //Note file does not have to be written to disk in order to update preview image
              if (bFileExists === false) {
                let buff = await previewImageInfo.image.toBuffer()
                await fileUtils.writeFileToDisk(dirHandle, tile_info.thirtyTwoFileName, buff)
              }

              emitter.emit('updatePreviewImage', {
                dir_handle: dirHandle,
                tile_info: tile_info,
                preview_image_info: previewImageInfo,
                map: map,
                updateStats: updateStats
              })
              that.qt.loading.hide()
            }else{
              // emitter.emit('updatePreviewImage', {
              //   dir_handle: dirHandle,
              //   tile_info: tile_info,
              //   preview_image_info: previewImageInfo,
              //   map: map,
              //   updateStats: updateStats
              // })
              that.qt.loading.hide()
            }
          } catch (e) {
            console.log(e)
            that.alertMsg = e
            that.alert = true
            that.qt.loading.hide()
          }
          that.qt.loading.hide()
        }
      });
    }
  }
}
</script>


