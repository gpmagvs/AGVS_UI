<template>
    <div>
        <canvas id="three"></canvas>
    </div>
</template>
<script>
import * as THREE from 'three'
export default {
    mounted() {
        this.initThree()
    },
    methods: {
        initThree() {
            const scene = new THREE.Scene()
            scene.background = new THREE.Color('#eee')
            const canvas = document.querySelector('#three')
            const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
            const camera = new THREE.PerspectiveCamera(
                50,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            )
            camera.position.z = 500
            // const controls = new THREE.OrbitControls(camera, canvas);

            const geometry = new THREE.BoxGeometry(100, 100, 100);
            const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

            const binRack = new THREE.Group();
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 10; j++) {
                    const bin = new THREE.Mesh(geometry, material);
                    bin.position.x = i * 120 - 240;
                    bin.position.y = j * 120 - 300;
                    binRack.add(bin);
                }
            }

            scene.add(binRack);
            function animate() {
                renderer.render(scene, camera)
                requestAnimationFrame(animate)
            }
            animate()
        },
    }
}
</script>
<style scoped>
#three {
    width: 100%;
    height: 100%
}
</style>