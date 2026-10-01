import request from '@/utils/request'

// 查询指纹比对日志列表
export function listFingermatch(query) {
  return request({
    url: '/tradelog/fingermatch/list',
    method: 'get',
    params: query
  })
}

// 查询指纹比对日志详细
export function getFingermatch(id) {
  return request({
    url: '/tradelog/fingermatch/' + id,
    method: 'get'
  })
}

// 导出指纹比对日志
export function exportFingermatch(query) {
  return request({
    url: '/tradelog/fingermatch/export',
    method: 'get',
    params: query
  })
}