import request from '@/utils/request'

// 查询微信公众号菜单列表
export function listWeixinMenu(query) {
  return request({
    url: '/msg/weixinMenu/list',
    method: 'get',
    params: query
  })
}

// 查询微信公众号菜单详细
export function getWeixinMenu(id) {
  return request({
    url: '/msg/weixinMenu/' + id,
    method: 'get'
  })
}

// 新增微信公众号菜单
export function addWeixinMenu(data) {
  return request({
    url: '/msg/weixinMenu',
    method: 'post',
    data: data
  })
}

// 修改微信公众号菜单
export function updateWeixinMenu(data) {
  return request({
    url: '/msg/weixinMenu',
    method: 'put',
    data: data
  })
}

// 删除微信公众号菜单
export function delWeixinMenu(id) {
  return request({
    url: '/msg/weixinMenu/' + id,
    method: 'delete'
  })
}

// 导出微信公众号菜单
export function exportWeixinMenu(query) {
  return request({
    url: '/msg/weixinMenu/export',
    method: 'get',
    params: query
  })
}