<template>
    <div>
        <div class="table-selector" @mouseleave="() => { selectedRows = selectedCols = 0 }" @mousemove="handleMouseMove" @click="handleClick">
            <div v-for="col in maxColNum" :key="col" @mousemove="HandleMoseMoveOnRow($event, col)">
                <div class="cell d-flex" :class="{ 'selected': isSelected(col, row) }" v-for="row in maxRowNum" :key="row" @mousemove="HandleMoseMoveOnColumn($event, row)"></div>
            </div>
        </div>
        <p>選擇了 {{ selectedRows }} 行 和 {{ selectedCols }} 列 的表格</p>
    </div>
</template>
<script>
export default {
    props: {
        maxRowNum: {
            type: Number,
            default: 6
        },
        maxColNum: {
            type: Number,
            default: 10
        },
    },
    data() {
        return {
            selectedRows: 0,
            selectedCols: 0,
            hoverIndex: 0
        };
    },
    methods: {
        isSelected(col, row) {
            return row <= this.selectedRows && col <= this.selectedCols;
        },
        HandleMoseMoveOnRow(event, col) {
            const target = event.target;
            this.selectedCols = col
        },
        HandleMoseMoveOnColumn(event, row) {
            const target = event.target;
            this.selectedRows = row
        },
        handleClick() {
            this.$emit('on-selected', { row: this.selectedRows, col: this.selectedCols });
        }
    }
};
</script>
<style scoped>
.table-selector {
    display: grid;
    grid-template-columns: repeat(10, 20px);
    grid-gap: 2px;
}



.cell {
    width: 20px;
    height: 20px;
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    cursor: pointer;
}

.cell.selected {
    background-color: orange;
}
</style>