<style>
#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}

#infoRectangle {
  position: absolute;
  bottom: 5px;
  left: 5px;
  background-color: white;
  padding: 10px;
  z-index: 10;
  width: auto;
  height: auto;
  border-radius: 4px;
  line-height: 10px;
  font-size: 0.8em;
  text-align: center;


}

#mb-tbar {
  z-index: 1;
}

/*#info {*/
/*  display: table;*/
/*  position: relative;*/
/*  margin: 0px auto;*/
/*  word-wrap: anywhere;*/
/*  white-space: pre-wrap;*/
/*  padding: 0px;*/
/*  border: none;*/
/*  border-radius: 3px;*/
/*  font-size: 12px;*/
/*  text-align: center;*/
/*  color: #222;*/
/*  background: #fff;*/
/*}*/

</style>
<template>

  <div id="map">
    <pre id="features"></pre>
    <!--    <div id="infoRectangle"></div>-->
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

      &nbsp; &nbsp; &nbsp; {{ ' Zoom: ' + this.zoom + ' ' + this.tileInfoString }}
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
import {ref} from "vue";
import idbKeyval from '../utilities/idb-keyval-iife';
import fileUtils from '../utilities/fs-helpers'
import mapUtils from '../utilities/map-utils'
import emitter from "../utilities/emitter";

import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding'
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import DrawAssistedRectangle from "@geostarters/mapbox-gl-draw-rectangle-assisted-mode/dist/DrawAssistedRectangle";
import MapboxGLButtonControl from '@delebash/mapbox-gl-button-control'
import '../css/styles.css'
import tib from 'tiles-in-bbox'
import {useQuasar} from "quasar";
import {combineTilesJimp} from '../utilities/combine-tiles-jimp'

let draw
let geocoder

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
  name: 'mapbox-map-viewer',
  setup() {
    const $q = useQuasar()
    return {
      alert: ref(false),
      alertMsg: ref(''),
      tileInfoString: ref(''),
      dirHandle: ref(''),
      qt: $q,
      style_url: ref(''),
      zoom: ref(''),
      access_token: ref(''),
      rasterFromStyle: ref(false),
      mapbox_raster_png_dem: ref(''),
      mapbox_api_url: ref(''),
      drawmode: ref('simple_select'),
      mapbox_rgb_image_url: ref(''),
      map: ref(''),
      features: ref([]),
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
      console.log(this.drawmode)
    },

    loadMapSourcesLayers(map) {
      if (this.rasterFromStyle === false) {
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
          'maxzoom': 15
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
      }
    },
    coordinateFeature(lng, lat) {
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
    },

    resizeMap() {
      //Fixes size of map when drawer is closed
      this.map.resize()
    },

    async geoCodeReverse(tile_info) {
      const geocodingClient = mbxGeocoding({accessToken: mapboxgl.accessToken});

      geocodingClient.reverseGeocode({
        query: [tile_info.pointLng, tile_info.pointLat]
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

    async loadMapboxMap() {

      mapboxgl.accessToken = await idbKeyval.get('access_token')
      this.access_token = mapboxgl.accessToken
      this.mapbox_api_url = await idbKeyval.get('mapbox_api_url')
      this.dirHandle = await idbKeyval.get('dirHandle')

      this.style_url = await idbKeyval.get('mapbox_style_url')
      this.mapbox_raster_png_dem = await idbKeyval.get('mapbox_raster_png_dem')

      let that = this

      if (!mapboxgl.supported()) {
        this.alertMsg = 'Your browser does not support Mapbox GL'
        this.alert = true
      } else {
        let map = new mapboxgl.Map({
          container: 'map',
          trackResize: true,
          style: that.style_url,
          center: [-121.7598, 46.8760], //Mt. Rainier
          zoom: 9,
          maxZoom: 14,
          doubleClickZoom: false,
          antialias: true,
          boxZoom: true,
          failIfMajorPerformanceCaveat: true
        });

        this.map = map

        this.map.doubleClickZoom.disable()
        // ADD CONTROLS

        //Geocoder
        const coordinatesGeocoder = function (query) {
          // Match anything which looks like
          // decimal degrees coordinate pair.
          const matches = query.match(
            /^[ ]*(?:Lat: )?(-?\d+\.?\d*)[, ]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i
          );
          if (!matches) {
            return null;
          }

          const coord1 = Number(matches[1]);
          const coord2 = Number(matches[2]);
          const geocodes = [];

          if (coord1 < -90 || coord1 > 90) {
            // must be lng, lat
            geocodes.push(that.coordinateFeature(coord1, coord2));
          }

          if (coord2 < -90 || coord2 > 90) {
            // must be lat, lng
            geocodes.push(that.coordinateFeature(coord2, coord1));
          }

          if (geocodes.length === 0) {
            // else could be either lng, lat or lat, lng
            geocodes.push(that.coordinateFeature(coord1, coord2));
            geocodes.push(that.coordinateFeature(coord2, coord1));
          }
          return geocodes;
        };

        geocoder = new MapboxGeocoder({
          accessToken: this.access_token,
          mapboxgl: mapboxgl,
          localGeocoder: coordinatesGeocoder,
          zoom: 10,
          placeholder: 'Try: Lng , Lat or Name',
          reverseGeocode: true
        })

        map.addControl(geocoder)

        map.addControl(new mapboxgl.FullscreenControl({}))

        // Add zoom and rotation controls to the map.
        map.addControl(new mapboxgl.NavigationControl());

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
        const tile_select = new MapboxGLButtonControl({
          className: "mapbox-gl-draw_polygon",
          title: "Select single tile",
          eventHandler: that.changeDrawMode
        });

        map.addControl(tile_select);

        const rectangle = new MapboxGLButtonControl({
          className: "mapbox-gl-draw_line",
          title: "Draw Rectangle to select multiple tiles",
          eventHandler: that.changeDrawMode
        });

        map.addControl(rectangle);

        //Set default draw mode to Single Tile

        //Game Navigation Controls
        // pixels the map pans when the up or down arrow is clicked
        const deltaDistance = 100;

        // degrees the map rotates when the left or right arrow is clicked
        const deltaDegrees = 25;

        function easing(t) {
          return t * (2 - t);
        }

        //END ADD CONTROLS

        map.on('wheel', () => {
          that.zoom = Math.floor(map.getZoom());
        });

        map.on('load', function () {
          let btnTile = document.getElementsByClassName("mapbox-gl-draw_polygon")[0]
          btnTile.style.backgroundColor = "green"
          draw.changeMode('simple_select');
          this.drawmode = "simple_select"
          //load layers and set bound
          that.loadMapSourcesLayers(map)

          //Game Controls
          map.getCanvas().focus();

          //Keyboard controls
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

        map.on('click', async function (e) {
          if (that.drawmode === "simple_select") {
            let lng = e.lngLat.lng
            let lat = e.lngLat.lat
            let z = Math.floor(map.getZoom());
            that.zoom = z
            let tile_info = mapUtils.getTileInfo(lng, lat, false, 0, 0, z);

            idbKeyval.set('tile_info', tile_info)
            that.tileInfoString = 'Slippy Tile Info String: ' + tile_info.x + ',' + tile_info.y + ',' + tile_info.z + ' Bounding Box sides in KM: ' + (tile_info.distance)

            map.getSource('bounding_box_source').setData(tile_info.polygon_bb);
            map.setPaintProperty('bounding_box', 'fill-opacity', 0.45);
          }
        })

        map.on('dblclick', async function (e) {

          let dirHandle = await idbKeyval.get('dirHandle')

          //Verify user has permission to rea/write from selected directory
          if (await fileUtils.verifyPermission(dirHandle, true) === false) {
            console.error(`User did not grant permission to '${dirHandle.name}'`);
            return;
          }

          let tile_info = await idbKeyval.get('tile_info')
          that.tileInfoString = 'Slippy Tile Info String: ' + tile_info.x + ',' + tile_info.y + ',' + tile_info.z + ' Bounding Box sides in KM: ' + (tile_info.distance)

          if (that.drawmode === "simple_select") {
            that.qt.loading.show()
            //Reverse Geocoding
            //await that.geoCodeReverse(tile_info)

            that.mapbox_rgb_image_url = that.mapbox_api_url + that.mapbox_raster_png_dem + `/${tile_info.z}/${tile_info.x}/${tile_info.y}@2x.pngraw?access_token=` + that.access_token;
            //Get terrain rgb from selected tile
            let rgb_image = await mapUtils.getMapboxTerrainRgb(that.mapbox_rgb_image_url)
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
            that.qt.loading.hide()
          } else if (that.drawmode === "draw_assisted_rectangle") {
            that.qt.loading.show()
            let exportOptionsModel = await idbKeyval.get('exportOptionsModel')
            //let backendServer = await idbKeyval.get('backendServer')
            let saveStitchingFiles = await idbKeyval.get('saveStitchingFiles')
            let mapbox_raster_style_endpoint = await idbKeyval.get('mapbox_raster_style_endpoint') || 'https://api.mapbox.com/styles/v1'
            let mapbox_raster_style_url = await idbKeyval.get('mapbox_raster_style_url') || ''
            let z = Math.floor(map.getZoom());

            let bboxTiles = {
              left: tile_info.bbox[0],
              bottom: tile_info.bbox[1],
              right: tile_info.bbox[2],
              top: tile_info.bbox[3]
            }

            let tiles = tib.tilesInBbox(bboxTiles, z)
            let filesArray = []
            let splatArray = []
            let satArray = []
            try {
              for (let tile of tiles) {
                let fileInfo = {}
                tile_info = mapUtils.getTileInfo(0, 0, true, tile.x, tile.y, tile.z, tile_info.bbox);
                that.tileInfoString = 'Slippy Tile Info String: ' + tile_info.x + ',' + tile_info.y + ',' + tile_info.z + ' Bounding Box sides in KM: ' + (tile_info.distance)
                that.mapbox_rgb_image_url = that.mapbox_api_url + that.mapbox_raster_png_dem + `/${tile_info.z}/${tile_info.x}/${tile_info.y}@2x.pngraw?access_token=` + that.access_token;
                //Get terrain rgb from selected tile
                let rgb_image = await mapUtils.getMapboxTerrainRgb(that.mapbox_rgb_image_url)
                let rgb_buff = await rgb_image.toBuffer()

                if (saveStitchingFiles === true) {
                  await fileUtils.writeFileToDisk(dirHandle, tile_info.rgbFileName, rgb_buff)
                }

                fileInfo.x = tile_info.x
                fileInfo.y = tile_info.y
                fileInfo.buffer = rgb_buff
                filesArray.push(fileInfo)

                if (exportOptionsModel.includes('raster_style')) {
                  let rasterstyle_url = mapbox_raster_style_endpoint + '/' + mapbox_raster_style_url + '/tiles/512/' + `${tile_info.z}/${tile_info.x}/${tile_info.y}@2x?access_token=` + that.access_token;
                  let rgb_splat = await mapUtils.getMapboxTerrainRgb(rasterstyle_url)
                  let splat_buff = await rgb_splat.toBuffer()

                  fileInfo = {}
                  fileInfo.x = tile_info.x
                  fileInfo.y = tile_info.y
                  fileInfo.buffer = splat_buff
                  splatArray.push(fileInfo)
                }
                if (exportOptionsModel.includes('satellite')) {
                  let mapbox_satellite_endpoint = await idbKeyval.get('mapbox_satellite_endpoint')
                  let mapbox_satellite_image_url = mapbox_satellite_endpoint + `/${tile_info.z}/${tile_info.x}/${tile_info.y}@2x?access_token=` + that.access_token;

                  let sat_img = await mapUtils.getMapboxTerrainRgb(mapbox_satellite_image_url)
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

              if (exportOptionsModel.includes('raster_style')) {
                let imageBuffer = await combineTilesJimp(splatArray, size, size)
                await idbKeyval.set('splat_image_buffer', imageBuffer)
                await fileUtils.writeFileToDisk(dirHandle, 'splat_' + tile_info.rgbFileName, imageBuffer)
              }

              if (exportOptionsModel.includes('satellite')) {
                let imageBuffer = await combineTilesJimp(satArray, size, size)
                await idbKeyval.set('sat_image_buffer', imageBuffer)
                await fileUtils.writeFileToDisk(dirHandle, 'sat_' + tile_info.rgbFileName, imageBuffer)
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
                map: map
              })
              that.qt.loading.hide()
            } catch (e) {
              console.log(e)
              that.alertMsg = e
              that.alert = true
              that.qt.loading.hide()
            }
            that.qt.loading.hide()
          }
        })
      }
    }
  }
}


</script>

