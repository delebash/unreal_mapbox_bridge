<!--map.on('load', function () {-->
<!--map.resize();-->
<!--});-->
<style>
#map {
}

#mb-tbar {
  z-index: 1;
}

#menu {
  position: absolute;
  background: #efefef;
  padding: 10px;
  font-family: 'Open Sans', sans-serif;
}
</style>
<template>

  <div id="map">
    <q-toolbar id="mb-tbar" class="bg-black text-white q-pa-none q-ma-none">
      <q-toggle
        dark
        v-model="threedview"
        label="3D view"
        @update:model-value="change3D"
      />
    </q-toolbar>
  </div>
</template>
<!--      color="lime-11"-->
<!--      bg-color="green"-->
<!--      label-color="orange-->
<!--      color="lime-11" bg-color="green" filled-->
<!--      <q-select-->
<!--        dark-->
<!--        borderless-->
<!--        color="lime-11"-->
<!--        label="Selected Layer"-->
<!--        transition-show="scale"-->
<!--        transition-hide="scale"-->
<!--        style="width: 118px"-->
<!--        v-model="layer_type"-->
<!--        :options="options"-->
<!--        @update:model-value="changeStyle"-->
<!--      />-->


<script>
import {ref} from "vue";
import {createStore, get, set} from 'idb-keyval'

import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
// import { MapboxStyleSwitcherControl } from "mapbox-gl-style-switcher";
// import "mapbox-gl-style-switcher/styles.css";
// import mbxGeocoding from '@mapbox/mapbox-gl-geocoder'
import fileUtils from '../utilities/fileUtils'
import mapUtils from '../utilities/mapUtils'
import emitter from "../utilities/emitter";

const db = createStore('unreal_mapbox', 'user_settings');

export default {
  name: 'mapbox-map-viewer',
  setup() {
    return {
      dir_handle: ref(''),
      dir_name: ref(''),
      style_url: ref(''),
      access_token: ref(''),
      mapbox_raster_png_dem: ref(''),
      terrain_threed_dem: ref(''),
      map: ref(''),
      bb: ref(null),
      threedview: ref(false)
    }
  },
  mounted() {

  },
  methods: {
    async loadMapboxMap() {
      mapboxgl.accessToken = await get('access_token', db)
      this.access_token = mapboxgl.accessToken

      this.dir_handle = await get('dir_handle', db)
      this.dir_name = await get('dir_name', db)
      this.style_url = await get('style_url', db)
      this.mapbox_raster_png_dem = await get('mapbox_raster_png_dem', db)
      this.terrain_threed_dem = await get('terrain_threed_dem', db)

      let that = this

      let map = new mapboxgl.Map({
        container: 'map',
        trackResize: true,
        style: that.style_url,
        center: [-121.760473, 46.852830], //Mt Rainier
        zoom: 9,
        doubleClickZoom: false
      });

      this.map = map

      const coordinatesGeocoder = function (query) {
        // Match anything which looks like
        // decimal degrees coordinate pair.
        const matches = query.match(
          /^[ ]*(?:Lat: )?(-?\d+\.?\d*)[, ]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i
        );
        if (!matches) {
          return null;
        }

        function coordinateFeature(lng, lat) {
          return {
            center: [lng, lat],
            geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            place_name: 'Lat: ' + lat + ' Lng: ' + lng,
            place_type: ['coordinate'],
            properties: {},
            type: 'Feature'
          };
        }

        const coord1 = Number(matches[1]);
        const coord2 = Number(matches[2]);
        const geocodes = [];

        if (coord1 < -90 || coord1 > 90) {
          // must be lng, lat
          geocodes.push(coordinateFeature(coord1, coord2));
        }

        if (coord2 < -90 || coord2 > 90) {
          // must be lat, lng
          geocodes.push(coordinateFeature(coord2, coord1));
        }

        if (geocodes.length === 0) {
          // else could be either lng, lat or lat, lng
          geocodes.push(coordinateFeature(coord1, coord2));
          geocodes.push(coordinateFeature(coord2, coord1));
        }
        return geocodes;
      };

      map.addControl(new MapboxGeocoder({
        accessToken: this.access_token,
        mapboxgl: mapboxgl,
        localGeocoder: coordinatesGeocoder,
        zoom: 10,
        placeholder: 'Try: -40, 170 or  Name',
        reverseGeocode: true
      }));

      map.addControl(new mapboxgl.FullscreenControl({}))

      map.on('load', function () {
        map.showTileBoundaries = true;

        map.addSource('mapbox_raster_png_dem', {
          "type": "raster-dem",
          "url": that.mapbox_raster_png_dem,
        });

        // Hillshade
        map.addLayer({
          "id": "hillshading",
          "source": "mapbox_raster_png_dem",
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

        //set invisible on load
        map.addLayer({
          id: 'bounding_box',
          type: 'fill',
          source: 'bounding_box_source',
          layout: {},
          paint: {
            'fill-color': '#008888',
            'fill-opacity': 0
          }
        });

        map.addSource('10m-bathymetry-81bsvj', {
          type: 'vector',
          url: 'mapbox://mapbox.9tm8dx88'
        });

        map.addLayer(
          {
            'id': '10m-bathymetry-81bsvj',
            'type': 'fill',
            'source': '10m-bathymetry-81bsvj',
            'source-layer': '10m-bathymetry-81bsvj',
            'layout': {},
            'paint': {
              'fill-outline-color': 'hsla(337, 82%, 62%, 0)',
              // cubic bezier is a four point curve for smooth and precise styling
              // adjust the points to change the rate and intensity of interpolation
              'fill-color': [
                'interpolate',
                ['cubic-bezier', 0, 0.5, 1, 0.5],
                ['get', 'DEPTH'],
                200,
                '#78bced',
                9000,
                '#15659f'
              ]
            }
          },
          'land-structure-polygon'
        );

      });
      map.on('error', e => {
        console.error(e);
      });

      map.on('click', async function (e) {
        let lng = e.lngLat.lng
        let lat = e.lngLat.lat

        let tile_info = mapUtils.getTileInfo(lng, lat, map);
        await set('tile_info', tile_info, db)

        map.getSource('bounding_box_source').setData(tile_info.bb);
        map.setPaintProperty('bounding_box', 'fill-opacity', 0.45);

        let mapbox_api_url = await get('mapbox_api_url', db)
        let mapbox_rgb_image_url = mapbox_api_url + `/mapbox.terrain-rgb/${tile_info.z}/${tile_info.x}/${tile_info.y}@2x.pngraw?access_token=` + that.access_token;


        let dir_handle = await get('dir_handle', db)
        let rgb_image = await fileUtils.getMapboxTerrainRgb(dir_handle, tile_info, mapbox_rgb_image_url)
        let rgb_buff = rgb_image.toBuffer()
        await set('rgb_image_buffer', rgb_buff, db)

        await fileUtils.writeFileToDisk(dir_handle, tile_info.rgbFileName, rgb_buff)

        let previewImageInfo = await fileUtils.createHeightMapImage(rgb_image, 32, "GREY")
        let bFileExists = await fileUtils.fileExists(dir_handle, tile_info.thirtytwoFile.name)
        //Note file does not have to be written to disk in order to update preview image
        if (bFileExists === false) {
          let buff = await previewImageInfo.image.toBuffer()
          await fileUtils.writeFileToDisk(dir_handle, tile_info.thirtytwoFile.name, buff)
        }

        emitter.emit('updatePreviewImage', {
          dir_handle: dir_handle,
          tile_info: tile_info,
          preview_image: previewImageInfo.image,
          stats: previewImageInfo.stats
        })
      })
    },
    resizeMap() {
      //Fixes size of map when drawer is closed
      this.map.resize()
    },
    change3D() {

      if (this.threedview === true) {
        //Add satellite imagery used for 3D
        this.map.addSource('mapbox-satellite', {
          'type': 'raster',
          'url': 'mapbox://mapbox.satellite',
          'tileSize': 512
        });

        //   //Add terrain-dem used for 3D
        this.map.addSource('mapbox-threeD', {
          'type': 'raster-dem',
          'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
          'tileSize': 512,
          'maxzoom': 14
        });

        this.map.addLayer({
          id: 'satellite',
          source: 'mapbox-satellite',
          type: "raster",
          // layout: {"visibility":"none"}
        });

        this.map.setTerrain({'source': 'mapbox-threeD', 'exaggeration': 1.5});
      } else {
        this.map.removeLayer('satellite')
        this.map.removeSource('mapbox-satellite')
        this.map.setTerrain(null)
        this.map.removeSource('mapbox-threeD')
      }
    },

    async geoCodeReverse(options) {
      await MapboxGeocoder
        .reverseGeocode({
          query: [options.lng, options.lat]
        })
        .send()
        .then(function (response) {
          if (response && response.body && response.body.features) {
            options.address = response.body.features[0].place_name
          }
        });
    }
  }
}


//
// (async () => {
//   const map = new mapboxgl.Map({
//     container: 'map',
//     zoom: 13,
//     center: [6.6301, 45.35625],
//     pitch: 80,
//     bearing: 160,
//     interactive: false,
//     style: 'mapbox://styles/mapbox/satellite-streets-v11'
//   });
//
//   await map.once('load');
// // Add fog
//   map.setFog({
//     'range': [-1, 1.5],
//     'color': 'white',
//     'horizon-blend': 0.1
//   });
//
// // Add some 3d terrain
//   map.addSource('mapbox-dem', {
//     'type': 'raster-dem',
//     'url': 'mapbox://mapbox.terrain-rgb',
//     'tileSize': 512,
//     'maxzoom': 14
//   });
//   map.setTerrain({
//     'source': 'mapbox-dem',
//     'exaggeration': 1.5
//   });
//
// // Add two different day and night sky layers so that we may switch between
// // them during animation. We add a sky opacity transition to slightly animate
// // the opacity updates.
//   map.addLayer({
//     'id': 'sky-day',
//     'type': 'sky',
//     'paint': {
//       'sky-type': 'gradient',
//       'sky-opacity-transition': { 'duration': 500 }
//     }
//   });
//   map.addLayer({
//     'id': 'sky-night',
//     'type': 'sky',
//     'paint': {
//       'sky-type': 'atmosphere',
//       'sky-atmosphere-sun': [90, 0],
//       'sky-atmosphere-halo-color': 'rgba(255, 255, 255, 0.5)',
//       'sky-atmosphere-color': 'rgba(255, 255, 255, 0.2)',
//       'sky-opacity': 0,
//       'sky-opacity-transition': { 'duration': 500 }
//     }
//   });

</script>

