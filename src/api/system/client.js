import request from '@/utils/request'

// 查询终端配置列表
export function listClient(query) {
  return request({
    url: '/system/client/list',
    method: 'get',
    params: query
  })
}

// 查询终端配置详细
export function getClient(clientId) {
  return request({
    url: '/system/client/' + clientId,
    method: 'get'
  })
}

// 新增终端配置
export function addClient(data) {
  return request({
    url: '/system/client',
    method: 'post',
    data: data
  })
}

// 修改终端配置
export function updateClient(data) {
  return request({
    url: '/system/client',
    method: 'put',
    data: data
  })
}

// 删除终端配置
export function delClient(clientId) {
  return request({
    url: '/system/client/' + clientId,
    method: 'delete'
  })
}

// 导出终端配置
export function exportClient(query) {
  return request({
    url: '/system/client/export',
    method: 'get',
    params: query
  })
}

// 清理参数缓存
export function clearCache() {
  return request({
    url: '/system/client/clearCache',
    method: 'delete'
  })
}