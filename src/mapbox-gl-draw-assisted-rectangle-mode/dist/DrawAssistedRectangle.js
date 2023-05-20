"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var doubleClickZoom = {
  enable: function enable(ctx) {
    setTimeout(function () {
      // First check we've got a map and some context.
      if (!ctx.map || !ctx.map.doubleClickZoom || !ctx._ctx || !ctx._ctx.store || !ctx._ctx.store.getInitialConfigValue) return;

      if (!ctx._ctx.store.getInitialConfigValue("doubleClickZoom")) return;
      ctx.map.doubleClickZoom.enable();
    }, 0);
  },
  disable: function disable(ctx) {
    setTimeout(function () {
      if (!ctx.map || !ctx.map.doubleClickZoom) return;

      ctx.map.doubleClickZoom.disable();
    }, 0);
  }
};

var DrawAssistedRectangle = {

  onSetup: function onSetup(opts) {
    var rectangle = this.newFeature({
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [[]]
      }
    });
    this.addFeature(rectangle);

    this.clearSelectedFeatures();
    doubleClickZoom.disable(this);
    this.updateUIClasses({
      mouse: "add"
    });
    this.setActionableState({
      trash: true
    });
    return {
      rectangle: rectangle,
      currentVertexPosition: 0
    };
  },

  onTap: function onTap(state, e) {

    this.onClick(state, e);
  },

  onClick: function onClick(state, e) {

    if (state.currentVertexPosition === 2) {

      var getpXY3 = this.calculatepXY3(state, e, false);

      if (getpXY3) {
        state.rectangle.updateCoordinate("0." + (state.currentVertexPosition + 1), getpXY3[0], getpXY3[1]);
      }
      this.updateUIClasses({
        mouse: "pointer"
      });
      return this.changeMode("simple_select", {
        featuresId: state.rectangle.id
      });
    } else {

      state.rectangle.updateCoordinate("0." + state.currentVertexPosition, e.lngLat.lng, e.lngLat.lat);
      state.currentVertexPosition++;
      state.rectangle.updateCoordinate("0." + state.currentVertexPosition, e.lngLat.lng, e.lngLat.lat);
    }
  },
  onMouseMove: function onMouseMove(state, e) {

    state.rectangle.updateCoordinate("0." + state.currentVertexPosition, e.lngLat.lng, e.lngLat.lat);
    if (state.currentVertexPosition && state.currentVertexPosition > 0) {

      this.calculateOrientedAnglePolygon(state);
    }

    if (state.currentVertexPosition === 2) {
      var getpXY3 = this.calculatepXY3(state, e, true);
      if (getpXY3) {
        state.rectangle.updateCoordinate("0." + (state.currentVertexPosition + 1), getpXY3[0], getpXY3[1]);
      }
    }
  },

  deegrees2meters: function deegrees2meters(px) {

    //gist from https://gist.github.com/springmeyer/871897
    var x = px[0] * 20037508.34 / 180;
    var y = Math.log(Math.tan((90 + px[1]) * Math.PI / 360)) / (Math.PI / 180);
    y = y * 20037508.34 / 180;
    return [x, y];
  },
  meters2degress: function meters2degress(px) {
    //gist from https://gist.github.com/springmeyer/871897
    var lon = px[0] * 180 / 20037508.34;
    var lat = Math.atan(Math.exp(px[1] * Math.PI / 20037508.34)) * 360 / Math.PI - 90;
    return [lon, lat];
  },


  calculateOrientedAnglePolygon: function calculateOrientedAnglePolygon(state) {
    var pXY0 = state.rectangle.getCoordinate("0.0");
    var pXY0_3857 = this.deegrees2meters(pXY0);
    var pXY1 = state.rectangle.getCoordinate("0.1");
    var pXY1_3857 = this.deegrees2meters(pXY1);

    var angleStdGraus = Math.atan2(pXY1_3857[1] - pXY0_3857[1], pXY1_3857[0] - pXY0_3857[0]) * 180 / Math.PI;
    var angleSudGraus = -1.0 * (angleStdGraus + 90);
    var angle = angleSudGraus < 0 ? angleSudGraus + 360 : angleSudGraus;

    state.angle = parseFloat(angle.toFixed(2));
  },

  calculatepXY3: function calculatepXY3(state, e, tmp) {

    var pXY0 = state.rectangle.getCoordinate("0.0");
    var pXY0_3857 = this.deegrees2meters(pXY0);
    var pXY1 = state.rectangle.getCoordinate("0.1");
    var pXY1_3857 = this.deegrees2meters(pXY1);
    var pXY2_3857 = this.deegrees2meters([e.lngLat.lng, e.lngLat.lat]);
    var mouse_3857 = this.deegrees2meters([e.lngLat.lng, e.lngLat.lat]);

    if (pXY0_3857[0] === pXY1_3857[0]) {
      pXY2_3857 = [mouse_3857[0], pXY1_3857[1]];
    } else if (pXY0_3857[1] === pXY1_3857[1]) {
      pXY2_3857 = [pXY1_3857[0], mouse_3857[1]];
    } else {

      var vector1_3857 = (pXY1_3857[1] - pXY0_3857[1]) / (pXY1_3857[0] - pXY0_3857[0]);
      var vector2_3857 = -1.0 / vector1_3857;

      if (Math.abs(vector2_3857) < 1) {
        pXY2_3857[1] = vector2_3857 * (mouse_3857[0] - pXY1_3857[0]) + pXY1_3857[1];
      } else {
        pXY2_3857[0] = pXY1_3857[0] + (pXY2_3857[1] - pXY1_3857[1]) / vector2_3857;
      }
    }

    var vector_3857 = [pXY1_3857[0] - pXY0_3857[0], pXY1_3857[1] - pXY0_3857[1]];
    var pXY3_3857 = [pXY2_3857[0] - vector_3857[0], pXY2_3857[1] - vector_3857[1]];
    var pXY2G = this.meters2degress(pXY2_3857);
    var pXY3G = this.meters2degress(pXY3_3857);
    state.rectangle.updateCoordinate("0.2", pXY2G[0], pXY2G[1]);
    state.rectangle.updateCoordinate("0.3", pXY3G[0], pXY3G[1]);

    return pXY3G;
  },

  onKeyUp: function onKeyUp(state, e) {
    if (e.keyCode === 27) return this.changeMode("simple_select");
  },
  onStop: function onStop(state) {
    doubleClickZoom.enable(this);
    this.updateUIClasses({
      mouse: "none"
    });
    this.activateUIButton();

    // check to see if we've deleted this feature
    if (this.getFeature(state.rectangle.id) === undefined) return;

    //remove last added coordinate
    state.rectangle.removeCoordinate("0.4");
    if (state.rectangle.isValid()) {
      this.map.fire("draw.create", {
        features: [state.rectangle.toGeoJSON()]
      });
    } else {
      this.deleteFeature([state.rectangle.id], {
        silent: true
      });
      this.changeMode("simple_select", {}, {
        silent: true
      });
    }
  },
  toDisplayFeatures: function toDisplayFeatures(state, geojson, display) {
    var isActivePolygon = geojson.properties.id === state.rectangle.id;
    geojson.properties.active = isActivePolygon ? "true" : "false";
    geojson.properties.angle = state.angle;
    geojson.angle = state.angle;
    if (!isActivePolygon) return display(geojson);

    var coordinateCount = geojson.geometry.coordinates[0].length;

    if (coordinateCount < 3) {

      var coordinates = geojson.geometry.coordinates[0][0];

      var vertexPoint = {
        type: "Feature",
        properties: geojson.properties,
        angle: state.angle,
        geometry: {
          coordinates: geojson.geometry.coordinates[0][0],
          type: "Point"
        }
      };

      if (coordinates) {
        display(vertexPoint);
      }

      return;
    }
    if (coordinateCount >= 3 && coordinateCount <= 4) {

      var lineCoordinates = [[geojson.geometry.coordinates[0][0][0], geojson.geometry.coordinates[0][0][1]], [geojson.geometry.coordinates[0][1][0], geojson.geometry.coordinates[0][1][1]]];

      display({
        type: "Feature",
        properties: geojson.properties,
        angle: state.angle,
        geometry: {
          coordinates: lineCoordinates,
          type: "LineString"
        }
      });
      if (coordinateCount === 3) {
        return;
      }
    }

    return display(geojson);
  },
  onTrash: function onTrash(state) {
    this.deleteFeature([state.rectangle.id], {
      silent: true
    });
    this.changeMode("simple_select");
  }
};

exports.default = DrawAssistedRectangle;