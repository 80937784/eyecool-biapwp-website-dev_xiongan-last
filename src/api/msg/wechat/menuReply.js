import request from '@/utils/request'

// 查询微信公众号菜单回复列表
export function listWeixinMenuReply(query) {
  return request({
    url: '/msg/weixinMenuReply/list',
    method: 'get',
    params: query
  })
}

// 查询微信公众号菜单回复详细
export function getWeixinMenuReply(id) {
  return request({
    url: '/msg/weixinMenuReply/' + id,
    method: 'get'
  })
}

// 新增微信公众号菜单回复
export function addWeixinMenuReply(data) {
  return request({
    url: '/msg/weixinMenuReply',
    method: 'post',
    data: data
  })
}

// 修改微信公众号菜单回复
export function updateWeixinMenuReply(data) {
  return request({
    url: '/msg/weixinMenuReply',
    method: 'put',
    data: data
  })
}

// 删除微信公众号菜单回复
export function delWeixinMenuReply(id) {
  return request({
    url: '/msg/weixinMenuReply/' + id,
    method: 'delete'
  })
}

// 导出微信公众号菜单回复
export function exportWeixinMenuReply(query) {
  return request({
    url: '/msg/weixinMenuReply/export',
    method: 'get',
    params: query
  })
}