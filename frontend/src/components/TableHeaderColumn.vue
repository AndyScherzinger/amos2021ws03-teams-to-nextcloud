<template>
    <th scope="col" :class="{'text-left': true, resizable}" :style="{'width': storedWidth}">
    <div :style="{'display': 'flex', 'justify-content': 'space-between'}">
        <slot>
            <span @click="reorderBy(orderKey)" style="user-select: none">
            <span>{{header}}</span><img :src="getOrderIcon(orderKey)" width="16" height="16">
            </span>
        </slot>
        <div :class="{'resizer': true, resizing: isResizing}" scope="col" v-if="resizable" @mousedown="startResize">
        </div>
    </div>
    </th>
</template>

<script>
export default {
    name: 'TableHeaderColumn',
    data() {
        return {
            isResizing: false
        }
    },
    computed: {
        storedWidth(){
            let columnWidth = this.$store.getters.getColumnWidth(this.orderKey);
            if(columnWidth){
                return columnWidth;
            }
            return null;
        }
    },
    props: { 
        'header': String ,
        'orderKey': String,
        'resizable': Boolean,
    },
    methods: {
        resize(event){
            if(!this.isResizing) return;
            let boundingBox = this.resizeColumn.getBoundingClientRect();
            let newWidth = event.clientX - boundingBox.left;
            this.resizeColumn.style.width = `${newWidth}px`;
        },
        startResize(){
            this.isResizing = true;
            this.resizeColumn = this.$el;
            document.addEventListener('mousemove', this.resize);
            document.addEventListener('mouseup', this.stopResize);
        },
        stopResize(){
          document.removeEventListener('mousemove', this.resize);
          this.isResizing = false;
          this.$store.dispatch('storeWidth', { orderKey: this.orderKey, width: this.resizeColumn.style.width });
        },
        reorderBy(orderKey) {
            this.$store.commit("setCurrentOrderProperty", orderKey);
            this.$store.commit("orderChildrenByCurrentOrderProperty");
        },
        getOrderIcon(orderKey) {
            if(orderKey === this.$store.getters.StateCurrentOrderProperty) {
                if(this.$store.getters.StateCurrentOrderDirection === "asc") {
                    return "images/up.svg";
                } else {
                    return "images/down.svg";
                }
            }
            return "images/bi.svg";
        }
  },
}
</script>

<style>
    .resizer
    {
        cursor: col-resize;
        margin-left: auto;
        margin-right: -3px;
    }

    .resizer::after,
    .resizer.resizing::after
    {
        content: "";
        background: #dee2e6;
        width: 2px;
        position: relative;
        height: 100%;
        opacity: 0;
        transition: opacity 300ms ease;
        display: inline-block;
    }

    .resizer.resizing::after
    {
      opacity: 1
    }

    .resizer.resizing::after
    {
        content: "";
        background: #dee2e6;
        width: 2px;
        position: relative;
        height: 100%;
        opacity: 1;
        display: inline-block;
    }
    .resizer:hover::after
    {
        opacity: 1;
    }
    .table th 
    {
        padding-right: 0;
    }
</style>
