<template>
  <q-layout view="lHr lpr lfr">
    <q-header dense elevated class="bg-primary text-white" height-hint="98">
    </q-header>

    <q-drawer dense show-if-above v-model="drawerLeft" side="left" @hide='resizeMap' class="no-margin no-padding">
      <div class="row  q-pt-sm q-pb-sm full-height">
        <q-card class="col q-pl-xs">
          <!-- drawer content -->
          <side-nav></side-nav>
        </q-card>
      </div>
    </q-drawer>
    <q-page-container>
      <q-page class="row no-margin q-pa-sm">
        <q-card class="col">
          <q-tabs
              dense
              v-model="selectedTab"
              class="text-grey"
              active-color="primary"
              indicator-color="primary"
              align="justify"
              narrow-indicator
          >
            <q-btn dense flat @click="changeDrawer" round icon="menu"/>
            <q-tab dense name="map" label="Map"/>
            <q-tab dense name="settings" label="Settings"/>
            <q-btn style="background: #FF0080; color: white" label="Help" class="q-mr-lg" @click="showDialog"/>
            <q-btn dense flat round
                   @click="$q.dark.toggle()"
                   :icon="$q.dark.isActive ? 'nights_stay' : 'wb_sunny'"
            />
          </q-tabs>
          <q-separator/>
          <q-tab-panels keep-alive v-model="selectedTab" animated>
            <q-tab-panel name="map" class="row q-pl-xs q-pt-xs q-pb-xs q-pr-none q-mr-none"
                         style="width: 100%; height: calc(100vh - 65px)">
              <mapbox-map-viewer class="col" ref="mapBoxViewer"></mapbox-map-viewer>
            </q-tab-panel>
            <q-tab-panel name="settings">
              See: <a href="https://docs.mapbox.com/help/glossary/access-token/" target="_blank">Mapbox access token
              docs</a>
              <q-input dense v-model="access_token" label="Mapbox Access Token *" filled
                       :type="isPwd ? 'password' : 'text'"
                       lazy-rules
                       hint="You will need your own access token created from your Mapbox accounts page. The Mapbox free plan is a great choice."
                       :rules="[ val => val && val.length > 0 || 'Please type something']">
                <template v-slot:append>
                  <q-icon dense
                      :name="isPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="isPwd = !isPwd"
                  />
                </template>
              </q-input>
              See: <a href="https://docs.mapbox.com/help/glossary/style-url/" target="_blank">Mapbox style url docs</a>
              <q-input dense class="q-pb-lg" v-model="style_url" label="Enter your Mapbox style url *" filled
                       lazy-rules
                       hint="You can use the default style or you can create your own custom style in Mapbox Studio."
                       :rules="[ val => val && val.length > 0 || 'Please type something']" :type="isPwd ? '' : 'text'">
              </q-input>

              <q-input class="q-pb-lg" v-model="dir_name" label="Enter download directory path *"
                       filled
                       lazy-rules
                       :rules="[ val => val && val.length > 0 || 'Please type something']" :type="isPwd ? '' : 'text'"
                       hint="Download folder path">

                <q-btn dense align="right" @click="fileDownloadDirectory()" color="secondary"
                       label="Select download folder"></q-btn>
              </q-input>
              <q-btn dense @click="saveUserSettings()" color="secondary"
                     label="Save settings"></q-btn>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>

import {ref} from 'vue'
import MapboxMapViewer from '../components/mapbox-map-viewer.vue'
import SideNav from '../components/side-nav.vue'
import {createStore, get, set} from 'idb-keyval'
import {Notify} from 'quasar'
import mapboxgl from "mapbox-gl";
import {useQuasar} from 'quasar'
import Help from '../components/help.vue'

const db = createStore('unreal_mapbox', 'user_settings');

export default {
  setup() {
    const $q = useQuasar()
    return {
      showDialog() {
        $q.dialog({
          component: Help,

          // props forwarded to your custom component
          componentProps: {
            text: 'something',
            // ...more..props...
          }
        }).onOk(() => {
          // console.log('OK')
        }).onCancel(() => {
          // console.log('Cancel')
        }).onDismiss(() => {
          // console.log('Called on OK or Cancel')
        })
      },
      data_path: '',
      selectedTab: ref('map'),
      dir_handle: ref(''),
      dir_name: ref(''),
      style_url: ref(''),
      access_token: ref(''),
      isPwd: ref(true),
      drawerLeft: ref(false)
    }
  },
  mounted: async function () {
    await set('mapbox_api_url', 'https://api.mapbox.com/v4', db)
    await set('mapbox_raster_png_dem', "mapbox://mapbox.terrain-rgb", db)
    await set('terrain_threed_dem', "mapbox://mapbox.mapbox-terrain-dem-v1", db)
    this.access_token = await get('access_token', db)

    //Load user data
    await this.loadUserData();
    //Check for existing settings api and url
    if (this.isRequiredSettings() === true) {
      await this.loadMap()
    }
  },
  methods: {
    resizeMap() {
      this.$refs.mapBoxViewer.resizeMap()
    },
    changeDrawer() {
      this.drawerLeft = !this.drawerLeft
    },
    async loadMap() {
      this.selectedTab = "map"
      await this.$nextTick(() => {
        this.$refs.mapBoxViewer.loadMapboxMap()
      })
    },
    isRequiredSettings() {
      if (this.access_token && this.style_url && this.dir_handle) {
        return true
      } else {
        this.redirectToSettings()
        return false
      }
    },
    redirectToSettings() {
      this.selectedTab = "settings"
      Notify.create({
        color: 'negative',
        textColor: 'white',
        icon: 'report_problem',
        message: 'Please fill out the required fields!',
        position: 'top'
      })
    },
    async fileDownloadDirectory() {
      let dir_handle = await window.showDirectoryPicker();
      await set('dir_handle', dir_handle, db)
      this.dir_handle = dir_handle
      this.dir_name = dir_handle.name
    },

    saveUserSettings() {
      set('access_token', this.access_token, db)
      set('style_url', this.style_url, db)
      set('dir_handle', this.dir_handle, db)
      set('dir_name', this.dir_name, db)
      if (this.isRequiredSettings() === true) {
        this.loadMap()
      }
    },
    async loadUserData() {
      mapboxgl.accessToken = await get('access_token', db)
      this.access_token = mapboxgl.accessToken || ''
      this.style_url = await get('style_url', db) || ''
      if (this.style_url === '') {
        this.style_url = 'mapbox://styles/mapbox/streets-v11'
      }
      this.dir_handle = await get('dir_handle', db) || ''
      this.dir_name = await get('dir_name', db) || ''
    }
  },
  components: {
    MapboxMapViewer,
    SideNav,
    Help
  }
}
</script>
