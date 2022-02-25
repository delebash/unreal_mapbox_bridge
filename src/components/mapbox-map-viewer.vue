<style>
#map {
}

#mb-tbar {
  z-index: 1;
}

.mapboxgl-popup {
  max-width: 400px;
  font: 12px/20px 'Helvetica Neue', Arial, Helvetica, sans-serif;
}
</style>
<template>
  <div id="map">
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
    </q-toolbar>
  </div>
</template>

<script>
import {ref} from "vue";
import idbKeyval from '../utilities/idb-keyval-iife';
import fileUtils from '../utilities/fs-helpers'
import mapUtils from '../utilities/map-utils'
import emitter from "../utilities/emitter";

import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding'

let geocoder

export default {
  name: 'mapbox-map-viewer',
  setup() {
    return {
      dirHandle: ref(''),
      style_url: ref(''),
      access_token: ref(''),
      mapbox_raster_png_dem: ref(''),
      mapbox_api_url: ref(''),
      mapbox_rgb_image_url: ref(''),
      map: ref(''),
      // bb: ref(null),
      threedview: ref(false),
      layers: ref(['hillshading', 'bounding_box', 'undersea-features-lines', 'undersea-features-points', 'undersea-features-points-label', '10m-bathymetry-81bsvj']),
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
          label: 'Undersea Lines',
          value: 'undersea-features-lines'
        },
        {
          label: 'Undersea Points',
          value: 'undersea-features-points'
        },
        {
          label: 'Undersea Labels',
          value: 'undersea-features-points-label'
        },
        {
          label: 'Depth',
          value: '10m-bathymetry-81bsvj'
        },
        {
          label: 'Satellite',
          value: 'satellite'
        },
        {
          label: '3D',
          value: '3d'
        },
      ],
    }
  },
  mounted() {

  },
  methods: {
    async changeLayers(layers) {

      for (const layertype of this.layer_type) {
        if (layers.includes(layertype.value)) {
          if (layertype.value !== '3d') {
            this.map.setLayoutProperty(
                layertype.value,
                'visibility',
                'visible'
            )
          } else {
            this.map.setTerrain({'source': 'mapbox-3d', 'exaggeration': 1.5});
          }
        } else {
          if (layertype.value !== '3d') {
            this.map.setLayoutProperty(
                layertype.value,
                'visibility',
                'none'
            )
          } else {
            this.map.setTerrain(null)
          }
        }
      }
    },

    loadMapSourcesLayers(map) {

      map.addSource('mapbox_terrain_dem', {
        "type": "raster-dem",
        "url": 'mapbox://mapbox.mapbox-terrain-dem-v1',
      });
      map.addSource('satellite', {
        'type': 'raster',
        'url': 'mapbox://mapbox.satellite',
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
      // Hillshade
      map.addLayer({
        "id": "hillshading",
        "source": "mapbox_terrain_dem",
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
      });


      map.addSource('bathymetry', {
        type: 'vector',
        url: 'mapbox://mapbox-public.bathymetry'
      });

      map.addLayer({
        'id': 'undersea-features-lines',
        'type': 'line',
        'source': 'bathymetry',
        'source-layer': 'undersea-features-lines',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#ff69b4',
          'line-width': 2
        }
      });

      map.addLayer({
        'id': 'undersea-features-points',
        'type': 'circle',
        'source': 'bathymetry',
        'source-layer': 'undersea-features-points',
        'paint': {
          'circle-radius': 4,
          'circle-color': '#01fe01'
        }
      });

      map.addLayer({
        'id': 'undersea-features-points-label',
        'type': 'symbol',
        'source': 'bathymetry',
        'source-layer': 'undersea-features-points',
        'layout': {
          'text-field': '{name}',
          'text-anchor': 'top-left',
          'text-size': 12
        }
      });

      map.addSource('10m-bathymetry-81bsvj', {
        type: 'vector',
        url: 'mapbox://mapbox.9tm8dx88'
      });

      map.addSource('mapbox-3d', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
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

    },

    async loadMapboxMap() {
      mapboxgl.accessToken = await idbKeyval.get('access_token')
      this.access_token = mapboxgl.accessToken
      this.mapbox_api_url = await idbKeyval.get('mapbox_api_url')
      this.dirHandle = await idbKeyval.get('dirHandle')
      this.style_url = await idbKeyval.get('style_url')
      this.mapbox_raster_png_dem = await idbKeyval.get('mapbox_raster_png_dem')

      let that = this

      let map = new mapboxgl.Map({
        container: 'map',
        trackResize: true,
        style: that.style_url,
        center: [-121.7598, 46.8760], //Mt. Rainier
        zoom: 9,
        doubleClickZoom: true,
        antialias: true,
        boxZoom: true,
        failIfMajorPerformanceCaveat: true
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

      geocoder = new MapboxGeocoder({
        accessToken: this.access_token,
        mapboxgl: mapboxgl,
        localGeocoder: coordinatesGeocoder,
        zoom: 10,
        placeholder: 'Try: -40, 170 or  Name',
        reverseGeocode: true
      })
      map.addControl(geocoder)

      map.addControl(new mapboxgl.FullscreenControl({}))

      // Add zoom and rotation controls to the map.
      map.addControl(new mapboxgl.NavigationControl());

      //Game Navigation Controls
      // pixels the map pans when the up or down arrow is clicked
      const deltaDistance = 100;

      // degrees the map rotates when the left or right arrow is clicked
      const deltaDegrees = 25;

      function easing(t) {
        return t * (2 - t);
      }

      map.on('style.load', () => {
        const waiting = () => {
          if (!map.isStyleLoaded()) {
            setTimeout(waiting, 200);
          } else {
            //  if (that.style === "streets-v11") {
            that.loadMapSourcesLayers(map)
            //  }
          }
        };
        waiting();
      });

      map.on('load', function () {

        //Game Controls
        map.getCanvas().focus();

        map.getCanvas().addEventListener(
            'keydown',
            (e) => {
              e.preventDefault();
              if (e.which === 87) {
// w
                map.panBy([0, -deltaDistance], {
                  easing: easing
                });
              } else if (e.which === 83) {
// s
                map.panBy([0, deltaDistance], {
                  easing: easing
                });
              } else if (e.which === 65) {
// a
                map.easeTo({
                  bearing: map.getBearing() - deltaDegrees,
                  easing: easing
                });
              } else if (e.which === 68) {
// d
                map.easeTo({
                  bearing: map.getBearing() + deltaDegrees,
                  easing: easing
                });
              }
            },
            true
        );

      });
      map.on('error', e => {
        console.error(e);
      });

      map.on('click', async function (e) {

        let dirHandle = await idbKeyval.get('dirHandle')

        //Verify user has permission to rea/write from selected directory
        if (await fileUtils.verifyPermission(dirHandle, true) === false) {
          console.error(`User did not grant permission to '${dirHandle.name}'`);
          return;
        }

        let lng = e.lngLat.lng
        let lat = e.lngLat.lat

        let tile_info = mapUtils.getTileInfo(lng, lat, map);

        idbKeyval.set('tile_info', tile_info)

        //Reverse Geocoding
        await that.geoCodeReverse(tile_info)

        map.getSource('bounding_box_source').setData(tile_info.polygon_bb);
        map.setPaintProperty('bounding_box', 'fill-opacity', 0.45);


        //Long/Lat popup
        // new mapboxgl.Popup()
        //     .setLngLat(e.lngLat)
        //     .setHTML(`Long/Lat: (${lng.toFixed(4)} /  ${lat.toFixed(4)})`)
        //     .addTo(map);


        that.mapbox_rgb_image_url = that.mapbox_api_url + that.mapbox_raster_png_dem + `/${tile_info.z}/${tile_info.x}/${tile_info.y}@2x.pngraw?access_token=` + that.access_token;
        //Get terrain rgb from selected tile
        let rgb_image = await mapUtils.getMapboxTerrainRgb(dirHandle, tile_info, that.mapbox_rgb_image_url)
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
      })

      map.on('mousemove', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        const features = map.queryRenderedFeatures(e.point);
        let depth
        let obj = {}
        for (const feat of features) {
          if (Object.keys(feat.type).length > 0) {
            if (Object.keys(feat.properties).length > 0) {
              let properties = feat.properties
              let layer = feat.layer
              if (properties.DEPTH) {
                obj.depth = properties.DEPTH
              } else {
              }
              obj.type = feat.type

              obj.id = layer.id
            }
          }
        }
      })
    }
    ,

    resizeMap() {
      //Fixes size of map when drawer is closed
      this.map.resize()
    }
    ,
    // async changeStyle() {
    //   if (this.map.getSource("mapbox-3d")) {
    //     this.map.setTerrain(null)
    //     this.map.removeSource("mapbox-3d");
    //     this.threedview = false
    //   }
    //   await this.map.setStyle('mapbox://styles/mapbox/' + this.style, {diff: false});
    // },


    async geoCodeReverse(tile_info) {
      // mapboxClient = mapboxSdk({ accessToken:  this.access_token });
      //  const baseClient = mbxClient({ accessToken: MY_ACCESS_TOKEN });
      const geocodingClient = mbxGeocoding({accessToken: mapboxgl.accessToken});

      geocodingClient.reverseGeocode({
        query: [tile_info.lng, tile_info.lat]
      })
          .send()
          .then(function (response) {
            if (response && response.body && response.body.features) {
              tile_info.address = response.body.features[0].place_name
              let context = response.body.features[0].context
              for (let feature of context) {
                let id = feature.id
                const type = id.substring(0, id.indexOf('.'))
                switch (type) {
                  case "neighborhood":
                    tile_info.neighborhood = feature.text
                    break;
                  case "postcode":
                    tile_info.postcode = feature.text
                    break;
                  case "locality":
                    tile_info.locality = feature.text
                    break;
                  case "place":
                    tile_info.place = feature.text
                    break;
                  case "district":
                    tile_info.district = feature.text
                    break;
                  case "region":
                    tile_info.region = feature.text
                    break;
                  case "country":
                    tile_info.country = feature.text
                    break;
                }
              }
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

