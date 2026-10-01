<template>
    <div class="box">
         <transition name="fade-transform" mode="out-in">
             <el-menu :router="true" v-if="oldRoutes.length" :default-active="defaultActive" class="el-menu-demo" background-color="#FFFFFF" text-color="rgba(0,0,0,0.65)" active-text-color="#1890FF" mode="horizontal" @select="handleSelect">
            <el-menu-item v-for="data in oldRoutes" :index="data.meta.fullPath" :key="data.meta.fullPath">{{data.meta.title}}</el-menu-item>
        </el-menu>
        </transition>   
    </div>
</template>
<script>
import {mapState,mapMutations} from 'vuex';
import { isExternal } from '@/utils/validate'
export default {
    name:'topbar',
    computed:{
        ...mapState({oldRoutes:state=>state.permission.oldRoutes}),
    },
    watch: {
        $route(val) {
            // this.defaultActive = val.meta.fullPath;
            // console.log(val);
            let path = val.path.split('/');
            let length = path.length;
            if(length === 3) {
                this.defaultActive ='/' + path[length-2] + '/' + path[length-1]
            }
            this.defaultActive ='/' + path[length-3] +'/' + path[length-2] + '/' + path[length-1]
            console.log(this.oldRoutes.length);
        }
    },
     data () {
            return {
                defaultActive:'/basedata/person/personinfo'
            }
        },
    methods: {
        handleSelect() {
            console.log(this.oldRoutes);
        },
        resolvePath(routePath) {
            if (isExternal(routePath)) {
                return routePath
            }
            if (isExternal(this.basePath)) {
                return this.basePath
            }
            return path.resolve(this.basePath, routePath)
        },
    }
}
</script>
<style lang="scss" scoped>
.box {
    width: 100%;
}
  .el-menu-demo {
    margin-left: 20PX;
    margin-right: 20PX;
    height: 52px;
    margin-top: 10px;
    box-sizing: border-box;
    border: none !important;
  }
  /deep/ .el-menu-item {
    height: 51px;
    line-height:51px;
  }
</style>