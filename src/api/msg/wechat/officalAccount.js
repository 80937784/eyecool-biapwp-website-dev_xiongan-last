import request from '@/utils/request'

// 查询微信公众号列表
export function listOfficalAccount(query) {
  return request({
    url: '/msg/officalAccount/list',
    method: 'get',
    params: query
  })
}

// 查询微信公众号详细
export function getOfficalAccount(id) {
  return request({
    url: '/msg/officalAccount/' + id,
    method: 'get'
  })
}

// 新增微信公众号
export function addOfficalAccount(data) {
  return request({
    url: '/msg/officalAccount',
    method: 'post',
    data: data
  })
}

// 修改微信公众号
export function updateOfficalAccount(data) {
  return request({
    url: '/msg/officalAccount',
    method: 'put',
    data: data
  })
}

// 删除微信公众号
export function delOfficalAccount(id) {
  return request({
    url: '/msg/officalAccount/' + id,
    method: 'delete'
  })
}

// 导出微信公众号
export function exportOfficalAccount(query) {
  return request({
    url: '/msg/officalAccount/export',
    method: 'get',
    params: query
  })
}

// 查询所有微信公众号列表
export function listAllOfficalAccount(query) {
  return request({
    url: '/msg/officalAccount/listAll',
    method: 'get',
    params: query
  })
}