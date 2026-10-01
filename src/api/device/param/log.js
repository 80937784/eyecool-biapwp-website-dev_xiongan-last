import request from '@/utils/request'

// 查询参数下发日志列表
export function listParamlog(query) {
  return request({
    url: '/device/paramlog/list',
    method: 'get',
    params: query
  })
}

// 查询参数下发日志详细
export function getParamlog(id) {
  return request({
    url: '/device/paramlog/' + id,
    method: 'get'
  })
}

// 新增参数下发日志
export function addParamlog(data) {
  return request({
    url: '/device/paramlog',
    method: 'post',
    data: data
  })
}

// 导出参数下发日志
export function exportParamlog(query) {
  return request({
    url: '/device/paramlog/export',
    method: 'get',
    params: query
  })
}