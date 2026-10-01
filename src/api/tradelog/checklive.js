import request from '@/utils/request'

// 查询人员人脸检活日志列表
export function listChecklive(query) {
  return request({
    url: '/tradelog/checklive/list',
    method: 'get',
    params: query
  })
}

// 查询人员人脸检活日志详细
export function getChecklive(id) {
  return request({
    url: '/tradelog/checklive/' + id,
    method: 'get'
  })
}

// 导出人员人脸检活日志
export function exportChecklive(query) {
  return request({
    url: '/tradelog/checklive/export',
    method: 'get',
    params: query
  })
}