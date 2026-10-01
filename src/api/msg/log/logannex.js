import request from '@/utils/request'

// 查询消息日志附件列表
export function listLogannex(query) {
  return request({
    url: '/msg/logannex/list',
    method: 'get',
    params: query
  })
}

// 查询消息日志附件详细
export function getLogannex(id) {
  return request({
    url: '/msg/logannex/' + id,
    method: 'get'
  })
}

// 导出消息日志附件
export function exportLogannex(query) {
  return request({
    url: '/msg/logannex/export',
    method: 'get',
    params: query
  })
}