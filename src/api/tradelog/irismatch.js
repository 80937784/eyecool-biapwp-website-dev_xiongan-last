import request from '@/utils/request'

// 查询虹膜比对日志列表
export function listIrismatch(query) {
  return request({
    url: '/tradelog/irismatch/list',
    method: 'get',
    params: query
  })
}

// 查询虹膜比对日志详细
export function getIrismatch(id) {
  return request({
    url: '/tradelog/irismatch/' + id,
    method: 'get'
  })
}

// 导出虹膜比对日志
export function exportIrismatch(query) {
  return request({
    url: '/tradelog/irismatch/export',
    method: 'get',
    params: query
  })
}