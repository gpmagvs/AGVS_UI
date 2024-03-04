<!-- 設定AGV在地圖上的顯示 -->
<!-- 可自行設定
    1.AGV顏色 
    2.AGV圖片ICON
    3.框與Tray的圖片
    4.是否要顯示Tray與框的圖示
-->
<template>
    <div class="agv_draw_setting ">
        <el-container class="h-100 ">
            <el-aside class="properties-setting-container border bg-light" width="50%">
                <div class="agv-id w-100 border-bottom mb-1 text-start text-primary">{{ agv_name }}</div>
                <div class="w-100 d-flex flex-row">
                    <el-form label-width="80" label-position="left">
                        <el-form-item label="顯示名稱">
                            <el-input type="text" size="small" v-model="props.DisplayText" @input="(text) => { ChangeTextOfAGV(text) }"></el-input>
                        </el-form-item>
                        <el-form-item label="顏色">
                            <el-color-picker v-model="props.DisplayColor" @active-change="HandleAGVColorClicked"></el-color-picker>
                        </el-form-item>
                        <el-form-item label="ICON"></el-form-item>
                    </el-form>
                    <el-form class="mx-3" label-width="120" label-position="left">
                        <el-form-item label="顯示貨物狀態">
                            <el-checkbox></el-checkbox>
                        </el-form-item>
                        <el-form-item label="貨物-[框]圖示"></el-form-item>
                        <el-form-item label="貨物-[Tray]圖示"></el-form-item>
                    </el-form>
                </div>
            </el-aside>
            <el-main class="border p-1" style="overflow-y: hidden;">
                <div class="text-start text-primary mb-3">Preview</div>
                <div :id="map_id"
                    class="agv-preview-map border w-100"
                    style="height: 200px;">
                </div>
            </el-main>
        </el-container>
    </div>
</template>

<script>

import Map from 'ol/Map.js';
import Projection from 'ol/proj/Projection.js';
import View from 'ol/View.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import VectorSource from 'ol/source/Vector.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import { AGVPointStyle, AgvDisplayProps, convertColorNameToRGBA } from '../mapjs'
import { Circle, Polygon } from 'ol/geom';
import { Fill, Stroke, Style, Circle as CircleStyle, Text } from 'ol/style';



export default {
    data() {
        return {
            map: undefined,
            agv_feature: undefined,
            _agvBodyFeature: undefined,
            _agvSaftyRegionFeature: undefined,
            props: new AgvDisplayProps()
        }
    },
    props: {
        agv_name: {
            type: String,
            default: "AGV_001"
        },
        raw_props: {
            type: AgvDisplayProps,
            default() {
                var _props = new AgvDisplayProps()
                return _props
            }
        }
    },
    computed: {
        map_id() {
            return 'map-agv-preview-' + this.agv_name
        },
        featureStyle() {
            return this.agv_feature.getStyle();
        }
    },
    methods: {
        MapInit() {
            const projection = new Projection({
                code: 'xkcd-image',
                units: 'pixels',
                extent: [-20, -20, 20, 20],
            });

            this.agv_feature = new Feature({
                geometry: new Point([0, 0])
            })
            this.agv_feature.setStyle(AGVPointStyle(this.raw_props.DisplayText, this.raw_props.DisplayColor))

            //AGV車體顯示
            const _agvBodyPolygon = new Polygon([[[-3, 4], [3, 4], [3, -4], [-3, -4]]])
            this._agvBodyFeature = new Feature(_agvBodyPolygon)
            this._agvBodyFeature.setStyle(new Style({
                fill: new Fill({ color: convertColorNameToRGBA(this.raw_props.DisplayColor, 0.6) }),
                stroke: new Stroke({
                    color: 'black',
                    width: 1
                })
            }))
            const _agvSaftyCircle = new Circle([0, 0], 5) //TODO 車輛安全區域半徑數據取得
            this._agvSaftyRegionFeature = new Feature(_agvSaftyCircle)
            const safyRegionColor = convertColorNameToRGBA(this.raw_props.DisplayColor, 0.2)
            this._agvSaftyRegionFeature.setStyle(new Style({
                fill: new Fill({ color: safyRegionColor }),
                stroke: new Stroke({
                    color: safyRegionColor, width: 1, lineDash: [5, 2]
                })
            }))
            const layer = new VectorLayer({
                source: new VectorSource({
                    features: [this.agv_feature, this._agvBodyFeature, this._agvSaftyRegionFeature],
                }),
                zIndex: 2
            })

            this.map = new Map({
                layers: [layer],
                target: this.map_id,
                view: new View({
                    projection: projection,
                    center: [0, 0],
                    zoom: 1,
                    maxZoom: 20
                })
            })
        },
        HandleAGVColorClicked(color) {
            this.props.DisplayColor = color;
            this.ChangeColorOfAGV(color)
        },
        HandleAGVColorSelected(c) {
            alert(c)
        },
        ChangeColorOfAGV(color) {
            this.SetFeatureFillColor(this.agv_feature, color, true);
            this.SetFeatureFillColor(this._agvBodyFeature, convertColorNameToRGBA(color, 0.6));
            this.SetFeatureFillColor(this._agvSaftyRegionFeature, convertColorNameToRGBA(color, 0.2));
        },
        ChangeTextOfAGV(str) {
            var style = this.agv_feature.getStyle();
            var text = style.getText();
            text.setText(str);
            this.agv_feature.setStyle(style)
        },
        SetFeatureFillColor(feature, color, isTextBg = false) {
            var style = feature.getStyle();
            if (isTextBg) {
                var text = style.getText();
                var fill = text.getBackgroundFill()
                fill.setColor(color)
                text.setBackgroundFill(fill);
            } else {
                var fill = style.getFill();
                fill.setColor(color)
                style.setFill(fill);
            }
            feature.setStyle(style)
        }

    },
    mounted() {
        this.MapInit();
        this.props = JSON.parse(JSON.stringify(this.raw_props))
    },
}
</script>

<style lang="scss" scoped>
.agv_draw_setting {
    height: 215px;
    margin: 5px;

    .properties-setting-container {
        .agv-id {
            font-size: 24px;
        }

        padding: 3px 8px;
        border-top-left-radius: 10px;
        border-bottom-left-radius: 4px;
    }
}
</style>