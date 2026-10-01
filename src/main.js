import "core-js/stable"
import 'regenerator-runtime/runtime'
import Vue from 'vue'

import Cookies from 'js-cookie'
import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
import './assets/styles/element-variables.scss'

// import '@/assets/styles/webkit-other.scss' 
import './mscsschange.js'
import moment from "moment"
import '@/assets/styles/index.scss' // global css
import '@/assets/styles/eyecool.scss' // eyecool css
import App from './App'
import store from './store'
import router from './router'
import permission from './directive/permission'
import countTo from 'vue-count-to';
import './assets/icons' // icon
import './assets/iconfont/iconfont.css'
import './permission' // permission control
import { getDicts } from "@/api/system/dict/data";
import { getConfigKey } from "@/api/system/config";
// import {TimePicker,Input,Form,Modal,Spin} from 'ant-design-vue';
import { parseTime, resetForm, addDateRange, selectDictLabel, selectDictLabels, download, handleTree } from "@/utils/eyecool";
import Pagination from "@/components/Pagination";
//自定义表格工具扩展
import RightToolbar from "@/components/RightToolbar"
// JSON格式化展示
import JsonViewer from 'vue-json-viewer'
import Driver from 'driver.js';
import 'driver.js/dist/driver.min.css';


// 全局方法挂载
Vue.prototype.driver = Driver
Vue.prototype.getDicts = getDicts
Vue.prototype.getConfigKey = getConfigKey
Vue.prototype.parseTime = parseTime
Vue.prototype.resetForm = resetForm
Vue.prototype.addDateRange = addDateRange
Vue.prototype.selectDictLabel = selectDictLabel
Vue.prototype.selectDictLabels = selectDictLabels
Vue.prototype.download = download
Vue.prototype.handleTree = handleTree
Vue.prototype.moment = moment
    // 客户端认证键值对
Vue.prototype.clientCredential = "web:123456"

Vue.prototype.msgSuccess = function(msg) {
    this.$message({ showClose: true, message: msg, type: "success" });
}

Vue.prototype.msgError = function(msg) {
    this.$message({ showClose: true, message: msg, type: "error" });
}

Vue.prototype.msgInfo = function(msg) {
    this.$message.info(msg);
}

// 全局组件挂载
Vue.component('Pagination', Pagination)
Vue.component('RightToolbar', RightToolbar)
Vue.component('countTo',countTo)
// Vue.use(TimePicker)
// Vue.use(Input)
// Vue.use(Form)
// Vue.use(Modal)
// Vue.use(Spin)
// Vue.use(Antd)
Vue.use(permission)
// JSON格式化展示
Vue.use(JsonViewer)


/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online! ! !
 */

Vue.use(Element, {
    size: Cookies.get('size') || 'medium' // set element-ui default size
})

Vue.config.productionTip = false

new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
})