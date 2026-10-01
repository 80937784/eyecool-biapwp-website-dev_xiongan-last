import request from '@/utils/request'

// 查询虹膜搜索日志列表
export function listIrissearch(query) {
  return request({
    url: '/tradelog/irissearch/list',
    method: 'get',
    params: query
  })
}

// 查询虹膜搜索日志详细
export function getIrissearch(id) {
  return request({
    url: '/tradelog/irissearch/' + id,
    method: 'get'
  })
}

// 导出虹膜搜索日志
export function exportIrissearch(query) {
  return request({
    url: '/tradelog/irissearch/export',
    method: 'get',
    params: query
  })
}