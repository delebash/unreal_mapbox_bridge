<template>
  <div id="mapweight"></div>
</template>

<script>
import {ref} from "vue";
import idbKeyval from '../utilities/idb-keyval-iife';
import mapUtils from '../utilities/map-utils'
import mapboxgl from 'mapbox-gl'
import '../css/styles.css'

import {useQuasar} from "quasar";

let mapweight = null
export default {
  name: "weightmap-viewer",
  setup() {
    const $q = useQuasar()
    return {
      qt: $q,
      access_token: ref('')
    }
  },
  methods: {
    async loadMapboxWeightMap() {
      let tile_info = await idbKeyval.get('tile_info')
      if (tile_info.hasOwnProperty("bbox")) {
        mapboxgl.accessToken = await idbKeyval.get('access_token')
        this.access_token = mapboxgl.accessToken

        let mapbox_raster_style_url = await idbKeyval.get('mapbox_raster_style_url') || ''

        let rasterstyle_url = 'mapbox://styles/' + mapbox_raster_style_url;

        if (mapweight === null) {
          mapweight = new mapboxgl.Map({
            container: 'mapweight',
            style: rasterstyle_url,
          });
        }

        mapweight.on('load', () => {
          // const waiting = () => {
          //   if (!mapweight.isStyleLoaded()) {
          //     setTimeout(waiting, 200);
          //   } else {
          //     //  if (that.style === "streets-v11") {
              this.loadMapSourcesLayers(mapweight)
          mapweight.getSource('bounding_box_source').setData(tile_info.polygon_bb);
          mapweight.setPaintProperty('bounding_box', 'fill-opacity', 0.45);
          mapweight.fitBounds(tile_info.bbox, {});
          //     //  }
          //   }
          // };
          // waiting();
        });

          mapweight.getSource('bounding_box_source').setData(tile_info.polygon_bb);
          mapweight.setPaintProperty('bounding_box', 'fill-opacity', 0.45);
          mapweight.fitBounds(tile_info.bbox, {});



      }
    },
    loadMapSourcesLayers(map) {
      mapweight.addSource('bounding_box_source', {
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

      mapweight.addLayer({
        id: 'bounding_box',
        type: 'fill',
        source: 'bounding_box_source',
        paint: {
          'fill-color': '#008888',
          'fill-opacity': 0
        }
      });
    }
  }
}
</script>

<style scoped>
#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}
</style>
