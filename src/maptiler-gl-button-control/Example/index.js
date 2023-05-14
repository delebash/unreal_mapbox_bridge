import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'
import './styles.css'
import MapboxGLButtonControl from '@delebash/mapbox-gl-button-control'

mapboxgl.accessToken =
    "your mapbox access token";

let map = new mapboxgl.Map({
    container: "map", // container id
    style: "mapbox://styles/mapbox/streets-v9", // stylesheet location
    center: [-64.75, 32.3], // starting position [lng, lat]
    zoom: 10 // starting zoom
});

/* Event Handlers */
function one(event) {
    alert("Event handler when clicking on \r\n" + event.target.className);
    console.log("event number 1", event);
}

function two(event) {
    alert("Event handler when clicking on \r\n" + event.target.className);
    console.log("event number 2", event);
}

function three(event) {
    alert("Event handler when clicking on \r\n" + event.target.className);
    console.log("event number 3", event);
}

/* Instantiate new controls with custom event handlers */
const ctrlPoint = new MapboxGLButtonControl({
    className: "mapbox-gl-draw_point",
    title: "Draw Point",
    eventHandler: one
});

const ctrlLine = new MapboxGLButtonControl({
    className: "mapbox-gl-draw_line",
    title: "Draw Line",
    eventHandler: two
});

const ctrlPolygon = new MapboxGLButtonControl({
    className: "mapbox-gl-draw_polygon",
    title: "Draw Polygon",
    eventHandler: three
});

/* Add Controls to the Map */
map.addControl(new mapboxgl.NavigationControl(), "top-left");
map.addControl(ctrlPoint, "bottom-left");
map.addControl(ctrlLine, "bottom-right");
map.addControl(ctrlPolygon, "top-right");
