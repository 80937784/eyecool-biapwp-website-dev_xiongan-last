import request from '@/utils/request'
import axios from 'axios'
import { Message, Loading } from 'element-ui'
import { getToken } from '@/utils/auth'
import { resolveBlob } from '@/utils/zipdownload'
const Base64 = require('js-base64').Base64

// 查询SDK文件上传列表
export function listSdkFile(query) {
    return request({
        url: '/tool/sdkFile/list',
        method: 'get',
        params: query
    })
}

// 查询SDK文件上传详细
export function getSdkFile(id) {
    return request({
        url: '/tool/sdkFile/' + id,
        method: 'get'
    })
}

// 删除SDK文件上传
export function delSdkFile(id) {
    return request({
        url: '/tool/sdkFile/' + id,
        method: 'delete'
    })
}

// 导出SDK文件上传
export function exportSdkFile(query) {
  return request({
    url: '/tool/sdkFile/export',
    method: 'get',
    params: query
  })
}

let loadingInstance;
const loadOption = { fullscreen: true, lock: true, text: '下载中......', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, 0.3)' }
export function downloadSdkFile(id) {
  var url = process.env.VUE_APP_BASE_API + '/tool/sdkFile/download/' + id;
  loadingInstance = Loading.service(loadOption);
  axios({
    method: 'get',
    url: url,
    responseType: 'blob',
    headers: { 'Authorization': 'Bearer ' + getToken(), 'ClientCredential': 'Basic ' + Base64.encode('web:123456') }
  }).then(res => {
    resolveBlob(res, 'application/zip');
    loadingInstance.close();
  }).catch(err => {
    Message({
      message: err,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(err)
  })
}
export function sdkDownloadUnsafe(id) {
  var url = process.env.VUE_APP_BASE_API + '/tool/sdkFile/downloadUnsafe/' + id;
  loadingInstance = Loading.service(loadOption);
  axios({
    method: 'get',
    url: url,
    responseType: 'blob',
    headers: { 'ClientCredential': 'Basic ' + Base64.encode('web:123456') }
  }).then(res => {
    resolveBlob(res, 'application/zip')
    loadingInstance.close();
  }).catch(e=>{
    Message({
      message: e,
      type: 'error',
      duration: 5 * 1000
    });
    loadingInstance.close();
  })
}


export function selectLastSdkUploads() {
  return request({
    url: '/tool/sdkFile/lastSDK',
    method: 'get'
  })
}