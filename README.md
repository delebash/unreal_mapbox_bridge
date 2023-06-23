#This app is no longer maintained please see the new app here https://github.com/delebash/unreal_map_bridge

#New live site https://map.justgeektechs.com/

# Unreal Mapbox Bridge 

#### Use real world heightmap data from Mapbox and automatically convert it to an Unreal heightmap image

# Live site [here](https://terrain.justgeektechs.com/)


# Plugin version for Unreal Egine 5 <a href="https://github.com/delebash/UnrealMapboxBridgePlugin" target="_blank">UnrealMapboxBridge</a>

# Tutorial Playlist

https://www.youtube.com/playlist?list=PLFCVXzupw1r_7ExUSGDxHGHU-gPRxOGeZ

Get Help here <a href="https://discord.gg/2WkHWNDf8q" target="_blank">Discord Server</a>

For what is coming next check the **<a href="https://trello.com/b/7jXYlo13/unreal-mapbox-bridge" target="_blank">RoadMap</a>**

Other free Unreal projects

https://github.com/delebash/unreal_vault_organizer


# Updates: 10/28/2022

## Added:

**Blur Radius** --  This will apply a blur to the heightmap.  It can be useful to reduce sharp edges and artifacts.  The greater the number the greater the blur.

## Added Buttons:

**Send to Terrain Magic** -- (only works with custom Terrain Magic code -- pm me on my discord channel if you want it).  If you use the Terrain Magic plugin from the UE market place then this will load your landscape into Terrain Magic.

**Copy Bounds for Blender Osm** -- If you use the Blender Osm plugin to generate real world landscapes, this will copy the coordinates you need to paste into the Blender Osm Plugin.  Osm has it's own map app but if you use this map app you can still have that capability.

**Copy Slippy Tile String** -- This will copy the Slippy Tile String Info.  Slippy Tile is a format for identifying Tile Information.  It is in the format x,y,z where z = zoom level.  Terrain Magic uses the Slippy Tile String, so until Send To Terrain Magic is fixed you can use this to copy and paste into Terrain Magic.

**Dist folder** -- contains compiled web app.  You should be able to run it from any web server.


## Install the dependencies
```bash
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
npm start
```

> NOTE:  When running the development server you will need to disble cors for your browser or the api calls to Mapbox will not work.  For Edge/Chrome there is a good plugin that I use to do this.  See https://microsoftedge.microsoft.com/addons/detail/cors-unblock/hkjklmhkbkdhlgnnfbbcihcajofmjgbh
> 

## Build
```bash
npm run build
```

## Setup

When you initially run the application you will have to set some data.

**Settings Tab**

1) Enter a mapbox access token under the Settings Tab in the Mapbox Access Token File field

    To get an access token you can create a free [mapbox account](https://www.mapbox.com/). Then goto your account page and copy the default access token or create a new one.

2) Choose a download directory from the Settings screen.

3) Click the Save Settings button

**Map Tab**

Left click and hold to drag around the map
Right click and hold to change the angle of the map

Scroll wheel to zoom in out

Game keys for navigation are also enabled WSAD

Type in a name or coordinates in the search box

Left click on the tile square you want to select. It will turn blue when selected.

You will see a preview of what the heightmap will look like as well as some statistics.

Click the download button to download the selected tile 16 bit heightmap file.

Select Terrain size youu want to use for your Unreal Landscape size.

The Scale number is correct but may look large in Unreal. You might want to use a different scale number when you import into Unreal.


**Manually resize method if you want to edit your hegitmap in a photo editor**

**Convert image to Unreal Landscape Size**

See Unreal Recommended Landscape Sizes [here](https://docs.unrealengine.com/4.27/en-US/BuildingWorlds/Landscape/TechnicalGuide/)

Resizing/Resampling an image for Unreal Landscapes has been added to the software.  Just select your Landscape size before you download your heightmap.  As an alternative to resizing in the application you can use other software to resize to custom sizes.

Programs you can use to resample your image to the landscape size you are using.

[GIMP](https://www.gimp.org/https://www.gimp.org/), [Affinity Photo](https://affinity.serif.com/en-us/photo/), [Photoshop](https://www.adobe.com/products/photoshop/landpa.html).
[Terra Sculptor](http://www.demenzunmedia.com/home/terresculptor/) -- is an awesome free program for creating and manipulating heightmap images.  It even has preset landscape sizes for Unreal.  To enable UDK go to Settings > Dimensions and check UDK Landscape.

The principle is the same for all. 

Example: **GIMP**

1) Choose File > Open then open the sixteen-x-x-x.png file for the tile you selected.  The numbers indicate the selected tile.

2) Choose Layer > Scale Layer
3) Type in the width and height (should be the same as in height: 2017 width: 2017)
4) Set the Interpolation to NoHalo and click Scale
5) Choose File > Export as and name your converted file.
6) On the popup dialog box named "Export image as PNG" leave all defaults and click Export.


Import the heightmap into Unreal per normal procedure.  You will need to adjust the Z-scale to the Z-scale shown on the app.

Example imported landscape standing on top of Mt. Rainier

![Mt. Rainier1](mt-rainier1.png)

![Mt. Rainier2](mt-rainier2.png)


*Inspired by and some code used from this [project](https://github.com/colkassad/terrain-rgb-height).  A Big thanks to Shane Brennan ([colkassad](https://github.com/colkassad)).*
