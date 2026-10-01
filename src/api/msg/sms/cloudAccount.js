import request from '@/utils/request'

// 查询短信云账户列表
export function listSmsCloudAccount(query) {
  return request({
    url: '/msg/smsCloudAccount/list',
    method: 'get',
    params: query
  })
}

// 查询短信云账户详细
export function getSmsCloudAccount(id) {
  return request({
    url: '/msg/smsCloudAccount/' + id,
    method: 'get'
  })
}

// 新增短信云账户
export function addSmsCloudAccount(data) {
  return request({
    url: '/msg/smsCloudAccount',
    method: 'post',
    data: data
  })
}

// 修改短信云账户
export function updateSmsCloudAccount(data) {
  return request({
    url: '/msg/smsCloudAccount',
    method: 'put',
    data: data
  })
}

// 删除短信云账户
export function delSmsCloudAccount(id) {
  return request({
    url: '/msg/smsCloudAccount/' + id,
    method: 'delete'
  })
}

// 导出短信云账户
export function exportSmsCloudAccount(query) {
  return request({
    url: '/msg/smsCloudAccount/export',
    method: 'get',
    params: query
  })
}

// 查询所有短信云账户列表
export function listAllSmsCloudAccount(query) {
  return request({
    url: '/msg/smsCloudAccount/listAll',
    method: 'get',
    params: query
  })
}