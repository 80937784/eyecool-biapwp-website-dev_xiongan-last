import request from '@/utils/request'

// 查询消息日志列表
export function listLog(query) {
  return request({
    url: '/msg/log/list',
    method: 'get',
    params: query
  })
}

// 查询消息日志详细
export function getLog(id) {
  return request({
    url: '/msg/log/' + id,
    method: 'get'
  })
}

// 导出消息日志
export function exportLog(query) {
  return request({
    url: '/msg/log/export',
    method: 'get',
    params: query
  })
}