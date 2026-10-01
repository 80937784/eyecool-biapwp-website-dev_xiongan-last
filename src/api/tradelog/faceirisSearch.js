import request from '@/utils/request'

// 查询人脸虹膜搜索日志列表
export function listFaceirisSearch(query) {
  return request({
    url: '/tradelog/faceirisSearch/list',
    method: 'get',
    params: query
  })
}

// 查询人脸虹膜搜索日志详细
export function getFaceirisSearch(id) {
  return request({
    url: '/tradelog/faceirisSearch/' + id,
    method: 'get'
  })
}

// 导出人脸虹膜搜索日志
export function exportFaceirisSearch(query) {
  return request({
    url: '/tradelog/faceirisSearch/export',
    method: 'get',
    params: query
  })
}