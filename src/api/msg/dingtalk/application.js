import request from '@/utils/request'

// 查询钉钉微应用列表
export function listDingApplication(query) {
  return request({
    url: '/msg/dingApplication/list',
    method: 'get',
    params: query
  })
}

// 查询钉钉微应用详细
export function getDingApplication(id) {
  return request({
    url: '/msg/dingApplication/' + id,
    method: 'get'
  })
}

// 新增钉钉微应用
export function addDingApplication(data) {
  return request({
    url: '/msg/dingApplication',
    method: 'post',
    data: data
  })
}

// 修改钉钉微应用
export function updateDingApplication(data) {
  return request({
    url: '/msg/dingApplication',
    method: 'put',
    data: data
  })
}

// 删除钉钉微应用
export function delDingApplication(id) {
  return request({
    url: '/msg/dingApplication/' + id,
    method: 'delete'
  })
}

// 导出钉钉微应用
export function exportDingApplication(query) {
  return request({
    url: '/msg/dingApplication/export',
    method: 'get',
    params: query
  })
}

// 查询所有钉钉微应用列表
export function listAllDingApplication(query) {
  return request({
    url: '/msg/dingApplication/listAll',
    method: 'get',
    params: query
  })
}