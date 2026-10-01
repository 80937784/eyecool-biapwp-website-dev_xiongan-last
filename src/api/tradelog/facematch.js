import request from '@/utils/request'

// 查询人脸比对日志列表
export function listFacematch(query) {
  return request({
    url: '/tradelog/facematch/list',
    method: 'get',
    params: query
  })
}

// 查询人脸比对日志详细
export function getFacematch(id) {
  return request({
    url: '/tradelog/facematch/' + id,
    method: 'get'
  })
}

// 导出人脸比对日志
export function exportFacematch(query) {
  return request({
    url: '/tradelog/facematch/export',
    method: 'get',
    params: query
  })
}