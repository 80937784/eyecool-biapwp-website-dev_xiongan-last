import request from '@/utils/request'

// 查询设备动作日志列表
export function listActionlog(query) {
  return request({
    url: '/device/actionlog/list',
    method: 'get',
    params: query
  })
}

// 查询设备动作日志详细
export function getActionlog(id) {
  return request({
    url: '/device/actionlog/' + id,
    method: 'get'
  })
}

// 导出设备动作日志
export function exportActionlog(query) {
  return request({
    url: '/device/actionlog/export',
    method: 'get',
    params: query
  })
}