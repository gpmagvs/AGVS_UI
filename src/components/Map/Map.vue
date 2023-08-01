<template>
  <div>
    <div id="agv_map" class="agv_map"></div>
  </div>
</template>

<script>

import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import Point from 'ol/geom/Point.js';
import TileJSON from 'ol/source/TileJSON.js';
import VectorSource from 'ol/source/Vector.js';
import LineString from 'ol/geom/LineString';
import Projection from 'ol/proj/Projection.js';
import Static from 'ol/source/ImageStatic.js';
import { getCenter } from 'ol/extent.js';
import View from 'ol/View.js';
import ImageLayer from 'ol/layer/Image.js';
import { Circle, Fill, Icon, Stroke, Style, Text } from 'ol/style.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';

import { StationPointStyle, StationTextStyle, CreateStationPathStyles } from './mapjs'

export default {
  data() {
    return {
      map: new Map(),
      PointLayer: new VectorLayer(),
      PointLinksLayer: new VectorLayer(),//路網(路線)

    }
  },
  methods: {
    InitImageLayer() {

    },
    /**初始化站點塗層 */
    InitStationPointLayer() {

      var demo = [0, 1, 2, 3, 4]
      var stationPointFeatures = []
      for (let index = 0; index < demo.length; index++) {
        var demo_x = demo[index];
        const iconFeature = new Feature({
          geometry: new Point([0, 0]),
        });
        iconFeature.set('index', demo_x)
        iconFeature.set('station_type', demo_x)
        iconFeature.set('targets', [demo_x + 1, demo_x - 2])
        var name = iconFeature.get('index') + '-Station'
        iconFeature.setStyle([StationPointStyle(demo_x), StationTextStyle(name)]);
        stationPointFeatures.push(iconFeature)
      }

      const vectorSource = new VectorSource({
        features: stationPointFeatures,
      });
      this.PointLayer = new VectorLayer({
        source: vectorSource,
      })
    },
    /**初始化路網路徑圖層 */
    InitStationPathLayer() {
      var stationFeatures = this.PointLayer.getSource().getFeatures()
      var stationLinkPathes = [];
      this.PointLayer.getSource().forEachFeature(feature => {
        var target_indexes = feature.get('targets')
        for (let index = 0; index < target_indexes.length; index++) {
          const pt_index = target_indexes[index];
          var target_feature = stationFeatures.find(f => f.get('index') == pt_index)
          if (target_feature) {
            let lineFeature = new Feature(
              {
                geometry: new LineString([feature.getGeometry().getCoordinates(), target_feature.getGeometry().getCoordinates()]),
              },
            );
            var isEqLink = target_feature.get('station_type') == 1;
            var path_id = `${feature.get('index')}_${pt_index}`
            lineFeature.set('path_id', path_id)
            lineFeature.set('isEqLink', isEqLink)
            // lineFeature.set('isPathClose', isEqLink)
            console.info(`路線:${path_id} create.EQLink? =>${isEqLink}`);
            lineFeature.setStyle(CreateStationPathStyles(lineFeature))
            stationLinkPathes.push(lineFeature)
          }
        }
      })
      debugger
      console.info(stationLinkPathes)
      const vectorSource = new VectorSource({
        features: stationLinkPathes,
      });
      this.PointLinksLayer = new VectorLayer({
        source: vectorSource,
      })
    }
  },
  mounted() {
    this.InitStationPointLayer();
    this.InitStationPathLayer();

    // Map views always need a projection.  Here we just want to map image
    // coordinates directly to map coordinates, so we create a projection that uses
    // the image extent in pixels.
    const extent = [-3750, -3750, 3750, 3750];
    const projection = new Projection({
      code: 'xkcd-image',
      units: 'pixels',
      extent: extent,
    });
    var imgLayer = new ImageLayer({
      source: new Static({
        url: 'Map.png',
        projection: projection,
        imageExtent: extent,
        imageSize: [1500, 1500],

      }),
    })

    this.map = new Map({
      layers: [imgLayer, this.PointLinksLayer, this.PointLayer],
      target: 'agv_map',
      view: new View({
        projection: projection,
        center: getCenter(extent),
        zoom: 1,
        maxZoom: 8
      })
    })
  },
}
</script>

<style lang="scss" scoped>
.agv_map {
  width: 100%;
  height: 786px;
  background-color: grey;
}
</style>