// Copyright (c) 2015 Uber Technologies, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
'use strict';

var assign = require('object-assign');
var alphaify = require('alphaify');
var r = require('r-dom');
var React = require('react');
var fs = require('fs');
var MapGL = require('react-map-gl');
var d3 = require('d3');
var Immutable = require('immutable');

var DraggablePoints = require('react-map-gl/src/overlays/draggable-points.react');

var stamenMapStyle = require('../../common/stamen-map-style');
var CodeSnippet = require('../../common/code-snippet.react');
var Markdown = require('../../common/markdown');

var initialPoints = [
  {location: [37.79450507471435, -122.39508481737994], id: 0},
  {location: [37.79227619464379, -122.39750244137034], id: 1},
  {location: [37.789251178427776, -122.4013303460217], id: 2},
  {location: [37.786862920252986, -122.40475531334141], id: 3},
  {location: [37.78861431712821, -122.40505751634022], id: 4},
  {location: [37.79060449046487, -122.40556118800487], id: 5},
  {location: [37.790047247333675, -122.4088854209916], id: 6},
  {location: [37.79275381746233, -122.4091876239904], id: 7},
  {location: [37.795619489534374, -122.40989276432093], id: 8},
  {location: [37.79792786675678, -122.41049717031848], id: 9},
  {location: [37.80031576728801, -122.4109001076502], id: 10},
  {location: [37.79920142331301, -122.41916032295062], id: 11}
];

var pointIds = initialPoints[initialPoints.length - 1].id;

module.exports = React.createClass({

  getInitialState: function getInitialState() {
    var normal = d3.random.normal();
    function wiggle(scale) {
      return normal() * scale;
    }
    return {
      map: {
        latitude: 37.78,
        longitude: -122.45,
        zoom: 11,
        mapStyle: stamenMapStyle,
        width: 700,
        height: 450,
        startDragLatLng: null
      },
      draggablePoints: Immutable.fromJS(initialPoints),
    };
  },

  _onAddPoint: function _onAddPoint(_location) {
    var points = this.state.draggablePoints.push(new Immutable.Map({
      location: new Immutable.List(_location),
      id: ++pointIds
    }));
    this.setState({draggablePoints: points});
  },

  _onUpdatePoint: function _onUpdatePoint(opt) {
    var index = this.state.draggablePoints.findIndex(function filter(p) {
      return p.get('id') === opt.key;
    });
    var point = this.state.draggablePoints.get(index);
    point = point.set('location', new Immutable.List(opt.location));
    var points = this.state.draggablePoints.set(index, point);
    this.setState({draggablePoints: points});
  },
  
  _onChangeViewport: function _onChangeViewport(opt) {
      this.setState({map: assign({}, this.state.map, opt)});
  },

  render: function render() {
    return r.div([
      r(Markdown, {
        text: fs.readFileSync(__dirname + '/draggable-points-overlay.md', 'utf-8')
      }),

      r(MapGL, assign({onChangeViewport: this._onChangeViewport}, this.state.map), [
        r(DraggablePoints, {
          points: this.state.draggablePoints,
          onAddPoint: this._onAddPoint,
          onUpdatePoint: this._onUpdatePoint,
          renderPoint: function renderPoint(point, pixel) {
            return r.g({}, [
              r.circle({
                r: 10,
                style: {
                  fill: alphaify('#1FBAD6', 0.5),
                  pointerEvents: 'all'
                }
              }),
              r.text({
                style: {fill: 'white', textAnchor: 'middle'},
                y: 5
              }, point.get('id'))
            ]);
          }
        })
      ]),
    ]);
  }

});
