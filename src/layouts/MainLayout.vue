<template>
  <q-layout view="lHr lpr lfr">
    <q-header dense elevated class="bg-primary text-white" height-hint="98">
    </q-header>
<!--    <ReloadPrompt/>-->
    <q-drawer dense show-if-above v-model="drawerLeft" side="left" @hide='resizeMap' class="no-margin no-padding">
      <div class="row  q-pa-xs full-height">
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
          <q-tab-panels class="q-pa-none q-ma-none" keep-alive v-model="selectedTab" animated>
            <q-tab-panel name="map" class="row q-pl-xs q-pt-xs q-pb-none q-ma-none"
                         style="width: 100%; height: calc(100vh - 65px)">
              <mapbox-map-viewer class="col" ref="mapBoxViewer"></mapbox-map-viewer>
            </q-tab-panel>
            <q-tab-panel lass="row q-pl-xs q-pt-xs q-pb-none q-ma-none" name="settings">
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
              <q-input dense class="q-pb-lg" v-model="mapbox_api_url" label="Mapbox base api url *" filled
                       lazy-rules
                       hint=""
                       :rules="[ val => val && val.length > 0 || 'Please type something']" :type="isPwd ? '' : 'text'">
              </q-input>
              <q-input dense class="q-pb-lg" v-model="mapbox_raster_png_dem" label="Mapbox Raster Dem Endpoint *" filled
                       lazy-rules
                       hint=""
                       :rules="[ val => val && val.length > 0 || 'Please type something']" :type="isPwd ? '' : 'text'">
              </q-input>
              <q-input dense class="q-pb-lg" v-model="mapbox_satellite_endpoint" label="Mapbox Satellite Endpoint *" filled
                       lazy-rules
                       hint=""
                       :rules="[ val => val && val.length > 0 || 'Please type something']" :type="isPwd ? '' : 'text'">
              </q-input>
              <div class="q-pa-none row items-start">
                <div class="col q-pa-none">
                  <q-input dense class="q-pb-none" v-model="dirName" label="Enter download directory path *"
                           filled
                           lazy-rules
                           :rules="[ val => val && val.length > 0 || 'Please type something']"
                           :type="isPwd ? '' : 'text'"
                  >
                  </q-input>
                </div>
                <q-btn class="q-pb-none" dense @click="openDirectory()" color="secondary"
                       label="Select download folder"></q-btn>
              </div>
              <!--              <q-checkbox v-model="createFolder" label="Creat a folder for each tile information downloaded" />-->
              <br>
<!--              <q-field class="q-pt-none q-mt-xs" dense label="Unreal Map Path" hint="Path to Unreal Map"-->
<!--              >-->
<!--                <q-input v-model="unrealMapPath"/>-->
<!--              </q-field>-->
<!--              <br>-->
              <q-btn class="q-pt-none" dense @click="saveUserSettings()" color="secondary"
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
import {Notify} from 'quasar'
import mapboxgl from "mapbox-gl";
import {useQuasar} from 'quasar'
import Help from '../components/help.vue'
import idbKeyval from '../utilities/idb-keyval-iife';
import fileUtils from '../utilities/fs-helpers';

// import ReloadPrompt from '../components/ReloadPrompt.vue'

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
      dirHandle: ref(''),
      dirName: ref(''),
      style_url: ref(''),
      access_token: ref(''),
      mapbox_api_url: ref(''),
      mapbox_raster_png_dem: ref(''),
      mapbox_satellite_endpoint: ref(''),
     // unrealMapPath: ref(''),
      isPwd: ref(true),
      drawerLeft: ref(false),
      createFolder: ref(false)
    }
  },

  mounted: async function () {


    //Load user data
    await this.loadUserData();
    //Check for existing settings api and url
    if (this.isRequiredSettings() === true
    ) {
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
      if (this.access_token && this.style_url && this.dirName) {
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
    async openDirectory() {
      let dirHandle
      try {
        dirHandle = await fileUtils.getDirHandle();
      } catch (ex) {
        if (ex.name === 'AbortError') {
          return;
        }
        const msg = 'An error occured trying to open the file.';
        console.error(msg, ex);
      }

      if (!dirHandle) {
        return;
      }
      idbKeyval.set('dirHandle', dirHandle);
      this.dirName = dirHandle.name
    },
    saveUserSettings() {
      idbKeyval.set('access_token', this.access_token);
      idbKeyval.set('style_url', this.style_url);
      idbKeyval.set('mapbox_api_url', this.mapbox_api_url);
      idbKeyval.set('mapbox_satellite_endpoint', this.mapbox_satellite_endpoint);
      idbKeyval.set('mapbox_raster_png_dem', this.mapbox_raster_png_dem);
      idbKeyval.set('create_folder', this.createFolder);
    //  idbKeyval.set('mappath', this.unrealMapPath );

      if (this.isRequiredSettings() === true) {
        this.loadMap()
      }
    },
    async loadUserData() {
      mapboxgl.accessToken = await idbKeyval.get('access_token')
      this.access_token = mapboxgl.accessToken || ''
      this.style_url = await idbKeyval.get('style_url') || 'mapbox://styles/mapbox/streets-v11'
      this.mapbox_api_url = await idbKeyval.get('mapbox_api_url') || 'https://api.mapbox.com/v4/'
      this.mapbox_satellite_endpoint = await idbKeyval.get('mapbox_satellite_endpoint') || 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles'
      this.mapbox_raster_png_dem = await idbKeyval.get('mapbox_raster_png_dem') || 'mapbox.mapbox-terrain-dem-v1'

      let dirHandle = await idbKeyval.get('dirHandle') || ''
      this.createFolder = await idbKeyval.get('create_folder') || ''
      this.dirHandle = dirHandle
      this.dirName = dirHandle.name
    }
  },
  components: {
    MapboxMapViewer,
    SideNav,
    Help
    // ReloadPrompt
  }
}
</script>
