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
      rasterFromStyle: ref(false),
      zoom: ref('')
    }
  },
  mounted() {
  },
  methods: {
    async loadMapSourcesLayers(map) {

      if (this.rasterFromStyle === false) {
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
      }
    },
    resizeMap() {
      //Fixes size of map when drawer is closed
      this.map.resize()
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
        maxZoom: 14,
        doubleClickZoom: false,
        terrainControl: true,
        fullscreenControl: true,
        failIfMajorPerformance: true
      });

      this.map = map

      //Add controls
      const gc = new GeocodingControl({
        apiKey: maptilersdk.config.apiKey,
        class: 'geocoder',
        showResultsWhileTyping: true,
        placeholder: 'Try: Lng , Lat or Name',

      });
      map.addControl(gc, 'top-right');


      map.on('load', function () {
        that.loadMapSourcesLayers(map)
      });
      map.on('click', async function (e) {

        let lng = e.lngLat.lng
        let lat = e.lngLat.lat
        let z = Math.floor(map.getZoom());
        that.zoom = z
        let tile_info = mapUtils.getTileInfo(lng, lat, false, 0, 0, z);

        idbKeyval.set('tile_info', tile_info)
        that.tileInfoString = 'Slippy Tile Info String: ' + tile_info.x + ',' + tile_info.y + ',' + tile_info.z + ' Bounding Box sides in KM: ' + (tile_info.distance)
        map.getSource('bounding_box_source').setData(tile_info.polygon_bb);
        map.setPaintProperty('bounding_box', 'fill-opacity', 0.45);
      })

      map.on('wheel', () => {
        that.zoom = Math.floor(map.getZoom());
      });

      map.on('error', e => {
        console.error(e);
      });

      map.on('dblclick', async function (e) {

        let dirHandle = await idbKeyval.get('dirHandle')

        //Verify user has permission to rea/write from selected directory
        if (await fileUtils.verifyPermission(dirHandle, true) === false) {
          console.error(`User did not grant permission to '${dirHandle.name}'`);
          return;
        }

        let tile_info = await idbKeyval.get('tile_info')
        that.tileInfoString = 'Slippy Tile Info String: ' + tile_info.x + ',' + tile_info.y + ',' + tile_info.z + ' Bounding Box sides in KM: ' + (tile_info.distance)
//https://api.maptiler.com/tiles/terrain-rgb-v2/10/536/358.webp?key=dfgdg
        that.maptiler_rgb_image_url = that.maptiler_raster_png_dem + `${tile_info.z}/${tile_info.x}/${tile_info.y}.webp?key=` + that.maptiler_access_token;
        //Get terrain rgb from selected tile

        let rgb_image = await mapUtils.getMapboxTerrainRgb(that.maptiler_rgb_image_url)
        let rgb_buff = await rgb_image.toBuffer()
        await idbKeyval.set('rgb_image_buffer', rgb_buff)
        await fileUtils.writeFileToDisk(dirHandle, tile_info.rgbFileName, rgb_buff)

        //Create preview imamge
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
          map: map
        })
      });
    }
  }
}
</script>


