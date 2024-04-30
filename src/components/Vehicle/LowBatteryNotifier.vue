<template>
    <div class=""> {{ forkAGV }} <el-button @click="Test">Test</el-button>
    </div>
</template>
<script lang="ts">

class Vehicle {
    // 屬性定義
    brand: string;
    model: string;
    year: number;

    // 構造函數
    constructor(brand: string, model: string, year: number) {
        this.brand = brand;
        this.model = model;
        this.year = year;
    }

    // 方法
    displayDetails(): void {
        console.log(`Brand: ${this.brand}, Model: ${this.model}, Year: ${this.year}`);
    }

    // 計算車輛年齡的方法
    calculateAge(currentYear: number): number {
        return currentYear - this.year;
    }
}

import axios from 'axios';
import { defineComponent } from 'vue'

export default defineComponent({
    data() {
        return {
            count: 1,
            forkAGV: new Vehicle('fuck up', 'benz', 3)
        }
    },
    methods: {
        async Test() {
            var ax = axios.create({ baseURL: 'http://127.0.0.1:3000/' })
            var response = await ax.get('umtcstatus/modify')
            var data = response.data;
            Object.assign(this.forkAGV, data)
            console.log(this.forkAGV);
        }
    }
})
</script>