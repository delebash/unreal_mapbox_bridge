import mapboxgl from "mapbox-gl";
import tilebelt from '@mapbox/tilebelt'
import * as turf from '@turf/turf'


function getTileInfo(lng, lat, map) {
    let tileInfo = {}
    let zoom = Math.floor(map.getZoom());
    let widthInMeters = 40075016.686 * Math.abs(Math.cos(lat)) / Math.pow(2, zoom);
    let metersPerPixel = widthInMeters / 512;

   let xyzpoint =  tilebelt.pointToTile(lng, lat, zoom)

    tileInfo.z = zoom
    tileInfo.x = xyzpoint[0]
    tileInfo.y = xyzpoint[1]
    tileInfo.long = lng
    tileInfo.lat = lat
    tileInfo.tileWidthInMeters = widthInMeters
    tileInfo.metersPerPixel = metersPerPixel
    tileInfo.polygon_bb = getTileGeoJsonBB(tileInfo)
    tileInfo.mapbox_tile_name = tileInfo.z + "-" + tileInfo.x + "-" + tileInfo.y
    tileInfo.rgbFileName = 'terrain-rgb' + "-" + tileInfo.mapbox_tile_name + '.png'
    tileInfo.thirtytwoFile = {name: 'thirtytwo' + "-" + tileInfo.mapbox_tile_name + '.png', bitDepth: 32}
    tileInfo.sixteenFile = {name: 'sixteen' + "-" + tileInfo.mapbox_tile_name, bitDepth: 16}

    let tile = [tileInfo.x,tileInfo.y,tileInfo.z] // x,y,z

    let bbox = tilebelt.tileToBBOX(tile);
    tileInfo.bbox = bbox

    const llb = new mapboxgl.LngLatBounds(tileInfo.bbox);
    let center = llb.getCenter(); // = LngLat {lng: -73.96365, lat: 40.78315}
    tileInfo.bbox_center = center

    return tileInfo
}

function getFeaturesFromBB(map, bbox) {
  //  console.log(bbox)
    if (bbox) {
        let sw = [bbox.geometry.coordinates[0][4]]
        let ne = [bbox.geometry.coordinates[0][2]]
        const swLonglat = new mapboxgl.LngLat(sw[0][0], sw[0][1]);
        const neLonglat = new mapboxgl.LngLat(ne[0][0], ne[0][1]);
        const swPt = map.project(swLonglat)
        const nePt = map.project(neLonglat)
        const features = map.queryRenderedFeatures(
            [swPt, nePt]
        )
        return features
    }
}


function getTileGeoJsonBB(tile_info) {
    let tile = [tile_info.x,tile_info.y,tile_info.z] // x,y,z
    let bbox = tilebelt.tileToBBOX(tile);
    let poly = turf.bboxPolygon(bbox);

    let geoJson = {
        'type': 'Feature',
        'geometry': {
            'type': poly.geometry.type,
            'coordinates': poly.geometry.coordinates
        }
    };
    return geoJson;

}

export default {getTileInfo, getFeaturesFromBB}
