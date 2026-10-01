import request from '@/utils/request'

// 查询人脸搜索日志列表
export function listFacesearch(query) {
  return request({
    url: '/tradelog/facesearch/list',
    method: 'get',
    params: query
  })
}

// 查询人脸搜索日志详细
export function getFacesearch(id) {
  return request({
    url: '/tradelog/facesearch/' + id,
    method: 'get'
  })
}

// 导出人脸搜索日志
export function exportFacesearch(query) {
  return request({
    url: '/tradelog/facesearch/export',
    method: 'get',
    params: query,
    timeout:0
  })
}