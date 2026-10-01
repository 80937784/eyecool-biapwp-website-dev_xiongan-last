import axios from 'axios'
import { getToken } from '@/utils/auth'
import { Loading, Message } from 'element-ui';

const loadOption = { fullscreen: true, lock: true, text: '请稍等......', spinner: 'el-icon-loading', background: 'rgba(0, 0, 0, 0.7)' }

const mimeMap = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip: 'application/zip'
}

const Base64 = require('js-base64').Base64
const baseUrl = process.env.VUE_APP_BASE_API
let loadingInstance;
export function downLoadZip(str, filename) {
  var url = baseUrl + str
  loadingInstance = Loading.service(loadOption);
  axios({
    method: 'get',
    url: url,
    responseType: 'blob',
    headers: {
      Authorization: 'Bearer ' + getToken(),
      ClientCredential: 'Basic ' + Base64.encode('web:123456')
    }
  }).then(res => {
    resolveBlob(res, mimeMap.zip)
    loadingInstance.close();
  }).catch(e => {
    console.log(e);
    loadingInstance.close();
  })
}

/**
 * 解析blob响应内容并下载
 * @param {*} res blob响应内容
 * @param {String} mimeType MIME类型
 */
export function resolveBlob(res, mimeType) {
  const aLink = document.createElement('a')
  var blob = new Blob([res.data], { type: mimeType })
  // //从response的headers中获取filename, 后端response.setHeader("Content-disposition", "attachment; filename=xxxx.docx") 设置的文件名;
  var patt = new RegExp('filename=([^;]+\\.[^\\.;]+);*')
  var contentDisposition = decodeURI(res.headers['content-disposition'])
  var result = patt.exec(contentDisposition)
  if(!result){
    var reader = new FileReader();
    reader.onload = function(event){
      var content = reader.result;//内容就在这里
      var err=JSON.parse(content).msg;
      Message({
        message: err,
        type: 'error',
        duration: 5 * 1000
      });
      return;
    };
    reader.readAsText(blob);
  }
  var fileName = result[1]
  fileName = fileName.replace(/\"/g, '')
  aLink.href = URL.createObjectURL(blob)
  aLink.setAttribute('download', fileName) // 设置下载文件名称
  document.body.appendChild(aLink)
  aLink.click()
  document.body.appendChild(aLink)
}
