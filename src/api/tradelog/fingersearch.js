import request from '@/utils/request'

// 查询指纹搜索日志列表
export function listFingersearch(query) {
  return request({
    url: '/tradelog/fingersearch/list',
    method: 'get',
    params: query
  })
}

// 查询指纹搜索日志详细
export function getFingersearch(id) {
  return request({
    url: '/tradelog/fingersearch/' + id,
    method: 'get'
  })
}

// 导出指纹搜索日志
export function exportFingersearch(query) {
  return request({
    url: '/tradelog/fingersearch/export',
    method: 'get',
    params: query
  })
}