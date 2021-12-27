import mapboxgl from "mapbox-gl";

function lng2tile(lng, zoom) {
    return (Math.floor((lng + 180) / 360 * Math.pow(2, zoom)));
}

function lat2tile(lat, zoom) {
    return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
}

function tile2lng(x, zoom) {
    return x / Math.pow(2, zoom) * 360 - 180;
}

function getTileInfo(lng, lat, map) {
    let tileInfo = {}
    let zoom = Math.floor(map.getZoom());
    let widthInMeters = 40075016.686 * Math.abs(Math.cos(lat)) / Math.pow(2, zoom);
    let metersPerPixel = widthInMeters / 512;

    tileInfo.z = zoom
    tileInfo.x = lng2tile(lng, zoom)
    tileInfo.y = lat2tile(lat, zoom)
    tileInfo.long = lng
    tileInfo.lat = lat
    tileInfo.tileWidthInMeters = widthInMeters
    tileInfo.metersPerPixel = metersPerPixel
    tileInfo.bb = getTileGeoJsonBB(tileInfo)
    tileInfo.mapbox_tile_name = tileInfo.z + "-" + tileInfo.x + "-" + tileInfo.y
    tileInfo.rgbFileName = 'terrain-rgb' + "-" + tileInfo.mapbox_tile_name + '.png'
    tileInfo.thirtytwoFile = {name: 'thirtytwo' + "-" + tileInfo.mapbox_tile_name + '.png', bitDepth: 32}
    tileInfo.sixteenFile = {name: 'sixteen' + "-" + tileInfo.mapbox_tile_name, bitDepth: 16}

    return tileInfo
}

function getFeaturesFromBB(map, bbox) {
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

function tile2lat(y, zoom) {
    let n = Math.PI - (2 * Math.PI * y) / Math.pow(2, zoom);
    let radians = Math.atan(Math.sinh(n));
    return radians * 180 / Math.PI;
}

function getTileGeoJsonBB(tile_info) {
    let bbCoords = {};
    bbCoords.north = tile2lat(tile_info.y, tile_info.z);
    bbCoords.south = tile2lat(tile_info.y + 1, tile_info.z);
    bbCoords.west = tile2lng(tile_info.x, tile_info.z);
    bbCoords.east = tile2lng(tile_info.x + 1, tile_info.z);

    let geoJson = {
        'type': 'Feature',
        'geometry': {
            'type': 'Polygon',
            'coordinates': [[[bbCoords.west, bbCoords.south],
                [bbCoords.east, bbCoords.south],
                [bbCoords.east, bbCoords.north],
                [bbCoords.west, bbCoords.north],
                [bbCoords.west, bbCoords.south]]]
        }
    };
    return geoJson;
}

export default {tile2lat, tile2lng, lat2tile, getTileInfo, getFeaturesFromBB}
