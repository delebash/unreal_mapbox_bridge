<template>
  <q-dialog class="dialog-plugin" ref="dialog" @hide="onDialogHide">
    <q-card style="width: 900px; max-width: 80vw; height: 700px;">
      <q-card-section>
        <div><b>Help</b>
        </div>
        <br>
        <q-separator></q-separator>

        <div class="q-mt-sm"><b>Settings Page:</b></div>
        <ol>
          <li>
            You need to create a free Mapbox account and enter your mapbox access token.
            Goto <a href="https://www.mapbox.com" target="_blank">Mapbox</a> then goto your account page. There you can
            copy
            your access token.
          </li>
          <li>
            Select a download folder. This is a folder on your local pc where your heightmap
            files will be saved.
          </li>
        </ol>

        <div class="q-mt-sm"><b>Map Page:</b></div>
        <ul>
          <li>
            <u>Map Settings</u> -- Enable different layers for viewing. This does not affect downloaded data
          </li>
          <li>
            <u>Search Bar</u> -- Enter the name of a location or Longitude Latitude seperated by a comma.
          </li>
          <li>
            <u>Top Bar</u> -- Area in KM show the area of the blue bounding box in Kilometers. Slippy Tile Info String
            is a standard
            format identification for downloading map tiles. Format is X,Y,Z Z = zoom level.
          </li>
        </ul>

        <div class=""><b>Map Navigation:</b></div>

        <ul>
          <li>
            <u>Select a Draw mode</u> -- Select a draw mode from the control on the right of the map.
            <br>
            <u><img src="/single_tile.png" alt="Single select"> Single tile select</u> -- Select a single tile (default mode)
            <br>
            <u><img src="/multiple_tile.png" alt="Multiple select"> Draw rectangle to select multiple tiles</u> --  Note you need to run the backend server for tile stitching
              See Tile stitching video on at the bottom for use.
          </li>
          <li>
            <u>Left Mouse Click</u> -- Selects a location on the map indicated by a blue bounding box.
          </li>
          <li>
            <u>Double Left Mouse Click</u> -- Download the tile preview and tile information.
          </li>
          <li>
            <u>Left Mouse Hold</u> -- Drag the mouse around to move the map.
          </li>
          <li>
            <u>Left Mouse Hold</u> -- Drag the mouse around to move the map.
          </li>
          <li>
            <u>Right Mouse Hold</u> -- Tilt and Rotate the map.
          </li>
          <li>
            <u>Scroll Wheel</u> -- Zoom in and out.
          </li>
          <li>
            <u>Arrow Keys</u> -- Move around the map.
          </li>
        </ul>

        <div class="q-mb-md"><b>Left Side Bar:</b></div>
        <div class="q-ml-md">
          <div><u>Export Type:</u>
            <ul>
              <li>
                <u>Unreal Heightmap</u> -- Generates a 16-bit png heightmap file. Can be used in other applications
                besides Unreal.
              </li>
              <li>
                <u>Unreal Terrain Magic Plugin -- EarthLandscape Clip</u> -- Sends tile info string x,y and zoom to
                Terrain Magic.
                You will need to install the custom version of Terrain Magic from this link <a
                href="https://github.com/delebash/unreal-terrain-magic/releases" target="_blank">Custom Version Of
                Terrain Magic</a>.
                Terrain magic has it's own map to import heightmaps for Unreal but I just added it to mine for ease of
                use.
                This just makes it a one click solution instead of copy and paste.
                If you like Terrain Magic please purchase it from the marketplace link in description. Original source
                for non-commercial <a href="https://github.com/GDi4K/unreal-terrain-magic" target="_blank">Terrain
                Magic</a>
              </li>
              <li>
                <u>Unreal Terrain Magic Plugin -- HeightmapLandscape Clip</u> -- Downloads heightmap from this app and
                loads it into Terrain Magic.
                You will need to install the custom version of Terrain Magic from this link <a
                href="https://github.com/delebash/unreal-terrain-magic/releases" target="_blank">Custom Version Of
                Terrain Magic</a>.
                Terrain magic has it's own map to import heightmaps for Unreal but I just added to mine for ease of use.
                This just makes it a one click solution instead of copy and paste.
                If you like Terrain Magic please purchase it from the marketplace link in description. Original source
                for non-commercial <a href="https://github.com/GDi4K/unreal-terrain-magic" target="_blank">Terrain
                Magic</a>
              </li>
              <li>
                <u>Unreal Stamp Brush Plugin</u> -- You need to install paid plugin <a
                href="https://www.unrealengine.com/marketplace/en-US/product/landscape-stamping-tool-100-custom-brushes?sessionInvalidated=true">Landscape
                Stamping Tool - 100+ Custom Brushes</a>.
                This automates the creation of new stamps from selected map location.
              </li>
              <li>
                <u>Unreal Landmass Effect Brush Plugin</u> -- Open source plugin for creating non-destructive landmass
                stamps and other features. Download the
                source from here <a
                href="https://github.com/AWeinb/SimplerLandmassBlueprints">SimplerLandmassBlueprints</a>.
                From the Content folder copy the whole Editor folder to your Content directory. Each time you click Send
                To Unreal it will import
                the texture to a sub folder CustomBrushes > Textures. For now it only imports the texture you have to
                manually add the texture to
                the brush according to the github instructions.
              </li>
              <li>
                <u>None</u> -- Generate 16-bit png heightmap but do not do any other transformations to the image.
              </li>
              <li>
                <u>Geojson Only</u> -- Do not download a heightmap png file. Just download a Geojson file.
              </li>
            </ul>
          </div>

          <div><u>Export Options:</u>
            <ul>
              <li>
                <u>Zrange-sea level=</u> -- By checking this the imported heightmap will keep the landscape height near
                100
                Unreal Units.
              </li>
              <li>
                <u>FlipX/FlipY</u> -- Flips the sides of the heightmap image in the X or Y direction.
              </li>
              <li>
                <u>Download Satellite</u> -- Downloads a Satellite Image of the selected area. This can be used as on
                overlay
                in UE.
              </li>
              <li>
                <u>Download Geojson Features</u> -- Downloads the features of the selected area in geojson format.
                Search
                Mapbox for geosjon.
              </li>
              <li>
                <u>Combine Unique Features</u> -- Removes overlapping features when downloading geojson
              </li>
              <li>
                <u>Create Weightmap (Splatmap) Files</u> -- You can now create weightmap files for use in Unreal for
                texturing your landscape.
                Setup and Use instructions https://www.youtube.com/watch?v=j_4pZ5EneVc&t=6s
              </li>
            </ul>
          </div>
        </div>

        <div><u>Landscape:</u>
          <ul>
            <li>
              <u>Landscape Size</u> -- Resamples the size of the image to recommended Unreal Landscape sizes.
            </li>
            <li>
              <u>Enable World Partition</u> -- If you have a World Partition project and want a World Partition
              landscape with proxies, enable this..
            </li>
            <li>
              <u>World Partition Grid Size</u> -- Grid size setting.
            </li>
            <li>
              <u>Landscape Name</u> -- Name of the landscape to be imported. (Optional
            </li>
            <li>
              <u>Blur Radius</u> -- Adds a gaussian blur to the heightmap png. This can help smooth out your imported
              landscape if it has some sharp edges. The greater the number the greater the blur. 0 = no blur.
            </li>
          </ul>
        </div>

        <div><u>Buttons:</u>
          <ul>
            <li>
              <u>Download Heightmap</u> -- Downloads the heightmap png to the folder location on the settings page.
            </li>
            <li>
              <u>Send To Unreal</u> -- Automatically imports heightmap or stamp into your Unreal project. Required --
              Mapbox_BP has to be installed in to your unreal project and configured.
              You can download the free plugin here <a href="https://github.com/delebash/UnrealMapboxBridgePlugin">Unreal
              Mapbox Bridge Plugin</a>.
            </li>
            <li>
              <u>Copy Bounds for Blender OSM</u> -- A plugin for blend that downloads real world map info into blender.
              It has it's own
              map but you can use this one as well since it has a search by name feature. Download <a
              href="https://github.com/vvoovv/blender-osm">Blender OSM</a>.
            </li>
            <li>
              <u>Copy Slippy Tile Info String</u> -- This format is used in many other GIS applications to download map
              tile information. This is just
              a convenience function. This is also the same string Terrain Magic expects.
            </li>
            <li>
              <u>Show Bounding Box Info</u> -- General info such as Long/Lat info for bounding box.
            </li>
          </ul>
        </div>

        <div><u>Videos:</u>
          <ul>
            <li>
              <a href="https://www.youtube.com/watch?v=wwEDuVmCayU&t">Unreal Mapbox Bridge Introduction and Setup
                (Updated 10/31/22)</a>
            </li>
            <li>
              <a href="https://www.youtube.com/watch?v=j_4pZ5EneVc&t">Weightmaps</a>
            </li>
            <li>
              <a href="https://www.youtube.com/watch?v=j_4pZ5EneVc&t">Work around to fix Mapbox Bridge imported
                landscape with artifacts</a>
            </li>
            <li>
              <a href="https://www.youtube.com/watch?v=Z3e5Zaxmo1c&tU">Tut on how to overlay a satellite image on your
                landscape</a>
            </li>
            <li>
              <a href="https://www.youtube.com/watch?v=dgtL6ISxTFU">Unreal Mapbox Bridge and Terrain Magic Integration
                update (01/02/2023)</a>
            </li>
            <li>
              <a href="https://www.youtube.com/watch?v=8b03jsvj1yo&t">Unreal Mapbox Bridge Integration with marketplace
                Landscape Stamping Tool</a>
            </li>
            <li>
              <a href="https://www.youtube.com/watch?v=v8Sln_Tzki8&t">Tile Stitching and Free Form Select</a>
            </li>
          </ul>
        </div>

        <q-card-actions class="absolute-top" align="right">
          App Version {{ appVersion }}&nbsp;
          <q-btn color="primary" label="Close" @click="onOKClick"/>
        </q-card-actions>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import {version} from '../../package.json'
import {ref} from "vue";

export default {
  setup() {
    return {
      appVersion: ref(version)
    }
  },
  emits: [
    // REQUIRED
    'ok', 'hide'
  ],

  methods: {
    // following method is REQUIRED
    // (don't change its name --> "show")
    show() {
      this.$refs.dialog.show()
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide() {
      this.$refs.dialog.hide()
    },

    onDialogHide() {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('hide')
    },

    onOKClick() {
      // on OK, it is REQUIRED to
      // emit "ok" event (with optional payload)
      // before hiding the QDialog
      this.$emit('ok')
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      this.hide()
    },

    onCancelClick() {
      // we just need to hide the dialog
      this.hide()
    }
  }
}
</script>
