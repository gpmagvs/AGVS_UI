<template>
  <div class="agv-3d-state">
    <div class="state-info">
      <div class="text-start">
        <b-button class="bg-primary" @click="showStatusCard = !showStatusCard" size="sm" squared> 狀態資訊 <i v-if="!showStatusCard" class="bi bi-chevron-down"></i>
          <i v-else class="bi bi-chevron-up"></i>
        </b-button>
      </div>
      <div
        v-show="showStatusCard"
        class="px-3 py-3"
        style="background-color: rgba(255, 255, 255, 0.4);">
        <el-form>
          <el-form-item v-for="driver in DriversState" :key="driver.name" :label="driver.name">
            <el-form-item label="State" class="mx-2">
              <div style="width:40px">
                <el-input size="small" disabled min="0" v-model.number="driver.state"></el-input>
              </div>
            </el-form-item>
            <el-form-item label="Error Code" class="mx-2">
              <div style="width:40px">
                <el-input size="small" disabled min="0" v-model.number="driver.errorCode"></el-input>
              </div>
            </el-form-item>
          </el-form-item>
          <el-form-item label="卡匣在席">
            <el-checkbox v-model="isCarrierExist"></el-checkbox>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <!-- <dashboard :isLeftTurnSignalOn="true" :isHeadlightOn="true"></dashboard> -->
    <div class="border" id="my-three"></div>
  </div>
</template>


<script>
import { throttledRef } from '@vueuse/shared';
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { render } from '@vue/runtime-dom';
import bus from '@/event-bus.js'
import clsDriverState from '@/ViewModels/clsDriverState';
import dashboard from '../AGVDashboard/dashboard.vue';
import { AGVStatusStore } from '@/store';
export default {
  components: {
    dashboard,
  },
  data() {
    return {
      width: 730,
      height: 600,
      CarrierHeight: 60,
      ForkDepth: 10,
      CSTBarcodeReaderInstallHeight: 70,
      Fork: undefined,
      scene: null,
      renderer: null,
      camera: null,
      isCarrierExist: false,
      showStatusCard: false,
      DriverState: new clsDriverState(),
    }
  },
  computed: {
    forkMesh() {
      return this.scene.getObjectByName('fork')
    },
    carrierMesh() {
      return this.scene.getObjectByName('carrier')
    },
    ZAxisHeight() {
      return this.DriverState.position
    },
    DriversState() {
      return AGVStatusStore.getters.AGVStatus.DriversStates
    }
  },
  methods: {
    CreateZAxisMesh() {
      const height = 210;
      const geometry = new THREE.BoxGeometry(20, 60, height)
      const material = new THREE.MeshLambertMaterial({
        color: 0x1c5c5c,
        transparent: false,
        opacity: 0.5
      })
      const zaxis_beam = new THREE.Mesh(geometry, material);
      zaxis_beam.position.set(-100, 0, height / 2);
      return zaxis_beam;
    },
    CreateForkMesh() {
      var geometry = new THREE.BoxGeometry(220, 60, this.ForkDepth);
      const material = new THREE.MeshLambertMaterial({
        color: 0x393939,
        transparent: false,
        opacity: 0.5
      })
      var fork = new THREE.Mesh(geometry, material);
      fork.name = 'fork'
      fork.position.set(0, 0, this.ZAxisHeight + this.ForkDepth * 2);

      return fork;
    },
    CreateCarrieMesh() {
      var geometry = new THREE.BoxGeometry(60, 60, 60);
      const material = new THREE.MeshLambertMaterial({
        color: 0x1e78fd,
        transparent: false,
        opacity: 1
      })
      var carrier = new THREE.Mesh(geometry, material);
      carrier.name = 'carrier'
      carrier.position.set(70, 0, this.ZAxisHeight + (this.CarrierHeight / 2) + (this.ForkDepth));
      return carrier;
    },
    CreateCSTBCRMesh() {
      var geometry = new THREE.BoxGeometry(10, 10, 10);
      const material = new THREE.MeshLambertMaterial({
        color: 0x000000,
        transparent: false,
        opacity: 1
      })
      var CSTBCRMesh = new THREE.Mesh(geometry, material);
      CSTBCRMesh.name = 'cst-bcr'
      CSTBCRMesh.position.set(-90, 0, this.CSTBarcodeReaderInstallHeight);
      return CSTBCRMesh;
    },
    Init3DModel() {
      const scene = new THREE.Scene();
      const geometry = new THREE.BoxGeometry(220, 60, 40)
      const material = new THREE.MeshLambertMaterial({
        color: 0x5c5c5c,
        transparent: false,
        opacity: 0.5
      })
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      scene.add(this.CreateZAxisMesh());
      scene.add(this.CreateForkMesh());
      scene.add(this.CreateCarrieMesh());
      scene.add(this.CreateCSTBCRMesh());

      var plane = new THREE.PlaneGeometry(1000, 1000, 32);
      var plane_material = new THREE.MeshBasicMaterial({ color: 0xcccccc });
      var plane = new THREE.Mesh(plane, plane_material);
      plane.position.set(0, 0, 0);
      scene.add(plane);

      const ambient = new THREE.AmbientLight(0xffffff, 0.4);
      const light = new THREE.PointLight(0xffffff, 1);
      scene.add(ambient);
      light.position.set(220, 300, 400);
      scene.add(light);


      const camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.2, 2100);
      camera.position.set(0, 520, 270);
      camera.up.set(0, -1, 0)
      camera.lookAt(120, 120, 0);

      const axesHelper = new THREE.AxesHelper(1200);
      axesHelper.setColors('blue', 'green', 'red')
      scene.add(axesHelper);

      const renderer = new THREE.WebGLRenderer();
      renderer.setSize(this.width, this.height);
      renderer.render(scene, camera);

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.addEventListener('change', () => {
        renderer.render(scene, camera)

      })
      scene.background = new THREE.Color(0xFFFFFF);
      scene.rotation.z = Math.PI / 3;
      scene.position.y = 160;
      scene.position.z = -10;
      camera.zoom = 0.2
      this.scene = scene;
      this.renderer = renderer;
      this.camera = camera;
      var Animate = () => {
        requestAnimationFrame(Animate)
        this.carrierMesh.visible = this.isCarrierExist;
        renderer.render(scene, camera);
      }
      Animate();
      //this.LoadAGVStlModel(scene)
      return renderer.domElement;
    },

    ForkPositionChange() {

    },
    LoadAGVStlModel(screen) {
      const loader = new STLLoader();
      loader.load('/submarine_agv_model.STL', function (geometry) {
        const material = new THREE.MeshBasicMaterial({ color: 'grey' });
        const mesh = new THREE.Mesh(geometry, material);
        screen.add(mesh);
      });
    }
  },
  mounted() {
    bus.on('/zaxis_driver_state', (driver_state) => {
      this.DriverState = driver_state;
    })
    var domElement = this.Init3DModel();
    document.getElementById('my-three')?.appendChild(domElement)

    setInterval(() => {
      this.forkMesh.position.z = this.ZAxisHeight + 20;
      this.carrierMesh.position.z = this.ZAxisHeight + 20 + (this.CarrierHeight / 2) + (this.ForkDepth / 2);
    }, 100);

  },
}
</script>

<style scoped lang="scss">
.agv-3d-state {
  max-width: 740px;

  .state-info {
    position: absolute;
  }
}
</style>