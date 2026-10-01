import request from '@/utils/request'

// 查询邮箱配置列表
export function listMailProperty(query) {
  return request({
    url: '/msg/mailProperty/list',
    method: 'get',
    params: query
  })
}

// 查询邮箱配置详细
export function getMailProperty(id) {
  return request({
    url: '/msg/mailProperty/' + id,
    method: 'get'
  })
}

// 新增邮箱配置
export function addMailProperty(data) {
  return request({
    url: '/msg/mailProperty',
    method: 'post',
    data: data
  })
}

// 修改邮箱配置
export function updateMailProperty(data) {
  return request({
    url: '/msg/mailProperty',
    method: 'put',
    data: data
  })
}

// 删除邮箱配置
export function delMailProperty(id) {
  return request({
    url: '/msg/mailProperty/' + id,
    method: 'delete'
  })
}

// 导出邮箱配置
export function exportMailProperty(query) {
  return request({
    url: '/msg/mailProperty/export',
    method: 'get',
    params: query
  })
}