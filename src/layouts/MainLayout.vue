<template>
  <q-layout view="lHr lpr lfr">
    <q-header dense elevated class="bg-primary text-white" height-hint="98">
    </q-header>
    <!--    <ReloadPrompt/>-->
    <q-drawer dense show-if-above v-model="drawerLeft" side="left" @hide='resizeMap' class="no-margin no-padding">
      <div class="row  q-pa-xs full-height">
        <q-card class="col q-pl-xs">
          <!-- drawer content -->
          <side-nav ref="sideNavRef"></side-nav>
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
            <q-tab v-if="mapserver == 'Mapbox'" dense name="weightmap" @click="loadWeightMap()" label="Weight Map"/>
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
              <mapbox-map-viewer v-if="mapserver == 'Mapbox'" class="col" ref="mapBoxViewer"></mapbox-map-viewer>
              <maptiler-map-viewer v-if="mapserver == 'Maptiler'" class="col"
                                   ref="mapTilerViewer"></maptiler-map-viewer>
            </q-tab-panel>
            <q-tab-panel name="weightmap" class="row q-pl-xs q-pt-xs q-pb-none q-ma-none"
                         style="width: 100%; height: calc(100vh - 65px)">
              <weightmap-viewer class="col" ref="weightmapViewerRef"></weightmap-viewer>
            </q-tab-panel>
            <q-tab-panel lass="row q-pl-xs q-pt-xs q-pb-none q-ma-none" name="settings">
              <q-select @update:model-value="val => mapserverChange(val)" v-model="mapserver" :options="servertype"
                        label="Server Type"/>
              <div v-if="mapserver == 'Maptiler'">
                <div class="text-h6">
                  <u>Maptiler Settings</u>
                </div>
                <q-input dense v-model="maptiler_access_token" label="Maptiler Access Token *" filled
                         :type="isPwd ? 'password' : 'text'"
                         lazy-rules
                         hint="You will need your own access token created from your Maptiler accounts page. The Maptiler free plan is a great choice."
                         :rules="[ val => val && val.length > 0 || 'Please type something']">
                  <template v-slot:append>
                    <q-icon dense
                            :name="isPwd ? 'visibility_off' : 'visibility'"
                            class="cursor-pointer"
                            @click="isPwd = !isPwd"
                    />
                  </template>
                </q-input>
                <q-input dense class="q-pb-lg" v-model="maptiler_style_url" label="Enter your Maptiler style url *"
                         filled
                         lazy-rules
                         hint="You can use the default style or you can create your own custom style in Maptiler Studio."
                         :rules="[ val => val && val.length > 0 || 'Please type something']"
                         :type="isPwd ? '' : 'text'">
                </q-input>
                <q-input dense class="q-pb-lg" v-model="maptiler_api_url" label="Maptiler base api url *" filled
                         lazy-rules
                         hint=""
                         :rules="[ val => val && val.length > 0 || 'Please type something']"
                         :type="isPwd ? '' : 'text'">
                </q-input>
                <q-input dense class="q-pb-lg" v-model="maptiler_raster_png_dem" label="Maptiler Raster Dem Endpoint *"
                         filled
                         lazy-rules
                         hint=""
                         :rules="[ val => val && val.length > 0 || 'Please type something']"
                         :type="isPwd ? '' : 'text'">
                </q-input>
                <q-input dense class="q-pb-lg" v-model="maptiler_satellite_endpoint" label="Maptiler Satellite Endpoint *"
                         filled
                         lazy-rules
                         hint=""
                         :rules="[ val => val && val.length > 0 || 'Please type something']"
                         :type="isPwd ? '' : 'text'">
                </q-input>

<!--                Click <a-->
<!--                      Maptiler Weightmap Style</a>-->
<!--                to copy this style to your mapbox account and then paste your new style address in text box below in the-->
<!--                format name/style id example: delebash/clfzz7dot000001qilz330eyt-->
<!--                <q-input dense class="q-pb-lg" v-model="maptiler_raster_style_url"-->
<!--                         label="Maptiler Weight Map Style"-->
<!--                         filled-->
<!--                         lazy-rules-->
<!--                         hint=""-->
<!--                >-->
<!--                </q-input>-->
<!--                <q-input dense class="q-pb-lg" v-model="maptiler_raster_style_endpoint"-->
<!--                         label="Maptiler Raster From Style Endpoint"-->
<!--                         filled-->
<!--                         lazy-rules-->
<!--                         hint=""-->
<!--                >-->
<!--                </q-input>-->
              </div>

              <div v-if="mapserver == 'Mapbox'">
                <div class="text-h6">
                  <u>Mapbox Settings</u>
                </div>
                See: <a href="https://docs.mapbox.com/help/glossary/access-token/" target="_blank">Mapbox access token
                docs</a>
                <q-input dense v-model="mapbox_access_token" label="Mapbox Access Token *" filled
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
                See: <a href="https://docs.mapbox.com/help/glossary/style-url/" target="_blank">Mapbox style url
                docs</a>
                <q-input dense class="q-pb-lg" v-model="mapbox_style_url" label="Enter your Mapbox style url *" filled
                         lazy-rules
                         hint="You can use the default style or you can create your own custom style in Mapbox Studio."
                         :rules="[ val => val && val.length > 0 || 'Please type something']"
                         :type="isPwd ? '' : 'text'">
                </q-input>
                <q-input dense class="q-pb-lg" v-model="mapbox_api_url" label="Mapbox base api url *" filled
                         lazy-rules
                         hint=""
                         :rules="[ val => val && val.length > 0 || 'Please type something']"
                         :type="isPwd ? '' : 'text'">
                </q-input>
                <q-input dense class="q-pb-lg" v-model="mapbox_raster_png_dem" label="Mapbox Raster Dem Endpoint *"
                         filled
                         lazy-rules
                         hint=""
                         :rules="[ val => val && val.length > 0 || 'Please type something']"
                         :type="isPwd ? '' : 'text'">
                </q-input>
                <q-input dense class="q-pb-lg" v-model="mapbox_satellite_endpoint" label="Mapbox Satellite Endpoint *"
                         filled
                         lazy-rules
                         hint=""
                         :rules="[ val => val && val.length > 0 || 'Please type something']"
                         :type="isPwd ? '' : 'text'">
                </q-input>
                Click <a
                href="https://api.mapbox.com/styles/v1/delebash/clfzz7dot000001qilz330eyt.html?title=copy&access_token=pk.eyJ1IjoiZGVsZWJhc2giLCJhIjoiY2t1YWxkODF0MGh2NjJxcXA4czBpdXlmdyJ9.D_ngzR7j4vU1CILtpNLg4Q&zoomwheel=true&fresh=true#9.64/47.0529/-122.3211/0/7">Copy
                Mapbox Weightmap Style</a>
                to copy this style to your mapbox account and then paste your new style address in text box below in the
                format name/style id example: delebash/clfzz7dot000001qilz330eyt
                <q-input dense class="q-pb-lg" v-model="mapbox_raster_style_url"
                         label="Mapbox Weight Map Style"
                         filled
                         lazy-rules
                         hint=""
                >
                </q-input>
                <q-input dense class="q-pb-lg" v-model="mapbox_raster_style_endpoint"
                         label="Mapbox Raster From Style Endpoint"
                         filled
                         lazy-rules
                         hint=""
                >
                </q-input>
              </div>
<!--              <q-input dense class="q-pb-lg" v-model="backendServer" label="Backend Server for Tile Stitching"-->
<!--                       filled-->
<!--                       lazy-rules-->
<!--                       hint=""-->
<!--              >-->
<!--              </q-input>-->
              <q-checkbox v-model="saveStitchingFiles" label="Save Temp Stitching files to disk"/>
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
              <br>

              <div v-if="mapserver == 'Mapbox'" class="q-pa-md">
                <q-table
                  flat bordered
                  title="Weightmap colors"
                  :rows="rows"
                  :columns="columns"
                  row-key="name"
                  :selected-rows-label="getSelectedString"
                  selection="multiple"
                  v-model:selected="selected"
                  virtual-scroll
                  v-model:pagination="pagination"
                  :rows-per-page-options="[0]"
                  :loading="loading"
                >
                  <template v-slot:top>
                    <q-btn color="primary" :disable="loading" label="Add new color" @click="addRow"/>
                    <q-btn class="q-ml-sm" color="primary" :disable="loading" label="Delete selected rows"
                           @click="removeRow"/>
                  </template>
                  <template v-slot:body="props">
                    <q-tr :props="props">
                      <q-td>
                        <q-checkbox dense v-model="props.selected"/>
                      </q-td>
                      <q-td key="name" :props="props">
                        {{ props.row.name }}
                        <q-popup-edit v-model="props.row.name" title="Name" v-slot="scope" @save="saveRow">
                          <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set"/>
                        </q-popup-edit>
                      </q-td>
                      <q-td key="color" :props="props">
                        {{ props.row.color }}
                        <q-popup-edit v-model="props.row.color" title="r,g,b" v-slot="scope" @save="saveRow">
                          <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set"/>
                        </q-popup-edit>
                      </q-td>
                    </q-tr>
                  </template>
                </q-table>

              </div>
              <q-btn class="q-pt-none" dense @click="saveUserSettings()" color="secondary"
                     label="Save settings"></q-btn>

            </q-tab-panel>
          </q-tab-panels>
        </q-card>

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

      </q-page>
    </q-page-container>

  </q-layout>
</template>

<script>


import {ref, isProxy, toRaw} from 'vue';
import MapboxMapViewer from '../components/mapbox-map-viewer.vue'
import MaptilerMapViewer from '../components/maptiler-map-viewer.vue'
import WeightmapViewer from '../components/wieghtmap-viewer.vue'
import SideNav from '../components/side-nav.vue'
import {Notify} from 'quasar'
import {useQuasar} from 'quasar'
import Help from '../components/help.vue'
import idbKeyval from '../utilities/idb-keyval-iife';
import fileUtils from '../utilities/fs-helpers';


const columns = [
  {name: 'name', align: 'left', label: 'Name', field: 'name', sortable: true},
  {name: 'color', align: 'left', label: 'Color', field: 'color', sortable: true}
]

let rows = [
  {
    name: 'Forest',
    color: '201, 28, 19'
  },
  {
    name: 'Water',
    color: '78, 143, 207'

  },
  {
    name: 'Scrub',
    color: '143, 253, 139'

  }, {
    name: 'Trees',
    color: '34, 106, 32'

  },
  {
    name: 'Rock',
    color: '101, 100, 93'

  },
  {
    name: 'Sand',
    color: '243, 234, 129'

  },
  {
    name: 'Grass',
    color: '33, 225, 29'

  },
  {
    name: 'Glacier',
    color: '255, 255, 255'

  },
  {
    name: 'Landcover',
    color: '0, 0, 0'
  },
  {
    name: 'Hillshade',
    color: '242, 110, 220'
  }
]

export default {
  setup() {
    const $q = useQuasar()
    const selected = ref([])
    const loading = ref(false)
    return {
      mapserver: ref("Mapbox"),
      servertype: ["Maptiler", "Mapbox"],
      selected,
      columns,
      rows: ref(rows),
      loading,
      pagination: ref({
        rowsPerPage: 0
      }),
      getSelectedString() {
        return selected.value.length === 0 ? '' : `${selected.value.length} record${selected.value.length > 1 ? 's' : ''} selected of ${rows.length}`
      },
      showDialog() {
        $q.dialog({
          component: Help,

          // props forwarded to your custom component
          componentProps: {
            text: '',
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
      alert: ref(false),
      alertMsg: ref(''),
     // backendServer: ref(''),
      saveStitchingFiles: ref(false),
      dirHandle: ref(''),
      dirName: ref(''),
      maptiler_style_url: ref(''),
      maptiler_access_token: ref(''),
      maptiler_api_url: ref(''),
      maptiler_raster_png_dem: ref(''),
      maptiler_satellite_endpoint: ref(''),
      maptiler_raster_style_url: ref(''),
      maptiler_raster_style_endpoint: ref(''),
      mapbox_style_url: ref(''),
      mapbox_access_token: ref(''),
      mapbox_api_url: ref(''),
      mapbox_raster_style_endpoint: ref(''),
      mapbox_raster_style_url: ref(''),
      mapbox_raster_png_dem: ref(''),
      mapbox_satellite_endpoint: ref(''),
      // unrealMapPath: ref(''),
      isPwd: ref(true),
      drawerLeft: ref(false),
      createFolder: ref(false)
    }
  },

  mounted: async function () {
    this.checkFileApiSupport()

    //Load user data
    await this.loadUserData();
    //Check for existing settings api and url
    if (this.isRequiredSettings() === true
    ) {
      await this.loadMap()
    }

  },
  methods: {
    async mapserverChange(val) {
      this.mapserver = val
      idbKeyval.set('mapserver', this.mapserver);
      await this.loadUserData()
    },
    addRow() {
      let newRow = {name: 'Color', color: '0, 0, 0'}
      this.rows.push(newRow)

    },
    removeRow() {

      if (this.selected.length > 0) {
        let myrows = this.rows.filter(item => !this.selected.includes(item))
        this.rows = JSON.parse(JSON.stringify(myrows))
        this.saveRow()
      } else {
        this.alertMsg = 'Select row(s) to delete.'
        this.alert = true
      }
    },
    saveRow() {
      if (isProxy(this.rows)) {
        let rawData = toRaw(this.rows)
        idbKeyval.set('weightmap_data', rawData);
      } else {
        idbKeyval.set('weightmap_data', this.rows);
      }
    },
    checkFileApiSupport() {
      let bEnabled = fileUtils.checkFileApiSupport()
      if (bEnabled === false) {
        this.alertMsg = 'This browser does not support File System Access API.  Try Edge or Chrome.'
        this.alert = true
      }
    },
    resizeMap() {
      if (this.mapserver === 'Mapbox') {
        this.$refs.mapBoxViewer.resizeMap()
      } else if (this.mapserver === 'Maptiler') {
        this.$refs.mapTilerViewer.resizeMap()
      }
    },
    changeDrawer() {
      this.drawerLeft = !this.drawerLeft
    },
    async loadMap() {
      this.selectedTab = "map"
      await this.$nextTick(() => {
        if (this.mapserver === 'Mapbox') {
          this.$refs.mapBoxViewer.loadMapboxMap()
        } else if (this.mapserver === 'Maptiler') {
          this.$refs.mapTilerViewer.loadMapTilerMap()
        }
        this.$refs.sideNavRef.forceRefresh()
      })
    },
    async loadWeightMap() {
      await this.$nextTick(() => {
        if (this.mapserver === 'Mapbox') {
          this.$refs.weightmapViewerRef.loadMapboxWeightMap()
        }
      })
    },
    isRequiredSettings() {
      if (this.mapserver === 'Mapbox') {
        if (this.mapbox_access_token && this.mapbox_style_url && this.dirName) {
          return true
        } else {
          this.redirectToSettings()
          return false
        }
      } else if (this.mapserver === 'Maptiler') {
        // if (this.mapbox_access_token && this.mapbox_style_url && this.dirName) {
        return true
        // } else {
        //   this.redirectToSettings()
        //   return false
        // }
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
      idbKeyval.set('mapserver', this.mapserver);

      if (this.mapserver === 'Maptiler') {
        idbKeyval.set('maptiler_access_token', this.maptiler_access_token);
        idbKeyval.set('maptiler_style_url', this.maptiler_style_url);
        idbKeyval.set('maptiler_api_url', this.maptiler_api_url);
        idbKeyval.set('maptiler_raster_png_dem', this.maptiler_raster_png_dem);
        idbKeyval.set('maptiler_satellite_endpoint', this.maptiler_satellite_endpoint);
        idbKeyval.set('maptiler_raster_style_endpoint', this.maptiler_raster_style_endpoint);
        idbKeyval.set('maptiler_raster_style_url', this.maptiler_raster_style_url);
      } else if (this.mapserver === 'Mapbox') {
        idbKeyval.set('mapbox_access_token', this.mapbox_access_token);
        idbKeyval.set('mapbox_style_url', this.mapbox_style_url);
        idbKeyval.set('mapbox_api_url', this.mapbox_api_url);
        idbKeyval.set('mapbox_satellite_endpoint', this.mapbox_satellite_endpoint);
        idbKeyval.set('mapbox_raster_png_dem', this.mapbox_raster_png_dem);
        idbKeyval.set('mapbox_raster_style_endpoint', this.mapbox_raster_style_endpoint);
        idbKeyval.set('mapbox_raster_style_url', this.mapbox_raster_style_url);
      }

      idbKeyval.set('mapserver', this.mapserver);
      idbKeyval.set('create_folder', this.createFolder);
     // idbKeyval.set('backendServer', this.backendServer);
      idbKeyval.set('saveStitchingFiles', this.saveStitchingFiles);

      if (isProxy(this.rows)) {
        let rawData = toRaw(this.rows)
        idbKeyval.set('weightmap_data', rawData);
      } else {
        idbKeyval.set('weightmap_data', this.rows);
      }


      if (this.isRequiredSettings() === true) {
        this.loadMap()
      }
    },
    async loadUserData() {
      this.mapserver = await idbKeyval.get('mapserver') || 'Mapbox'
      if (this.mapserver === 'Maptiler') {
        this.maptiler_access_token = await idbKeyval.get('maptiler_access_token') || ''
        this.maptiler_style_url = await idbKeyval.get('maptiler_style_url') || 'https://api.maptiler.com/maps/streets/style.json'
        this.maptiler_raster_png_dem = await idbKeyval.get('maptiler_raster_png_dem') || 'https://api.maptiler.com/tiles/terrain-rgb-v2/'
        this.maptiler_api_url = await idbKeyval.get('maptiler_api_url') || 'https://api.maptiler.com'
        this.maptiler_satellite_endpoint = await idbKeyval.get('maptiler_satellite_endpoint') || 'https://api.maptiler.com/tiles/satellite-v2'
        this.maptiler_raster_style_endpoint = await idbKeyval.get('maptiler_raster_style_endpoint') || 'https://api.maptiler.com/maps'
        this.maptiler_raster_style_url = await idbKeyval.get('maptiler_raster_style_url') || ''

      } else if (this.mapserver === 'Mapbox') {
        this.mapbox_access_token = await idbKeyval.get('mapbox_access_token') || ''
        this.mapbox_style_url = await idbKeyval.get('mapbox_style_url') || 'mapbox://styles/mapbox/streets-v11'
        this.mapbox_api_url = await idbKeyval.get('mapbox_api_url') || 'https://api.mapbox.com/v4/'
        this.mapbox_satellite_endpoint = await idbKeyval.get('mapbox_satellite_endpoint') || 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles'
        this.mapbox_raster_png_dem = await idbKeyval.get('mapbox_raster_png_dem') || 'mapbox.mapbox-terrain-dem-v1'
        this.mapbox_raster_style_endpoint = await idbKeyval.get('mapbox_raster_style_endpoint') || 'https://api.mapbox.com/styles/v1'
        this.mapbox_raster_style_url = await idbKeyval.get('mapbox_raster_style_url') || ''
      }


      let dirHandle = await idbKeyval.get('dirHandle') || ''
      this.createFolder = await idbKeyval.get('create_folder') || ''
      this.saveStitchingFiles = await idbKeyval.get('saveStitchingFiles') || false
     // this.backendServer = await idbKeyval.get('backendServer') || 'http://localhost:3000/backend'
      let weight_data = await idbKeyval.get('weightmap_data') || []
      if (weight_data.length === 0) {
        idbKeyval.set('weightmap_data', rows);
        this.rows = rows
      } else {
        this.rows = weight_data
      }
      this.dirHandle = dirHandle
      this.dirName = dirHandle.name
    }
  },
  components: {
    MapboxMapViewer,
    MaptilerMapViewer,
    WeightmapViewer,
    SideNav,
    Help
    // ReloadPrompt
  }
}
</script>
