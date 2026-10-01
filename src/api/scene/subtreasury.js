import request from '@/utils/request'

// 查询子场景信息列表
export function listSubtreasury(query) {
  return request({
    url: '/scene/subtreasury/list',
    method: 'get',
    params: query
  })
}

// 查询子场景信息详细
export function getSubtreasury(id) {
  return request({
    url: '/scene/subtreasury/' + id,
    method: 'get'
  })
}

// 新增子场景信息
export function addSubtreasury(data) {
  return request({
    url: '/scene/subtreasury',
    method: 'post',
    data: data
  })
}

// 修改子场景信息
export function updateSubtreasury(data) {
  return request({
    url: '/scene/subtreasury',
    method: 'put',
    data: data
  })
}

// 删除子场景信息
export function delSubtreasury(id) {
  return request({
    url: '/scene/subtreasury/' + id,
    method: 'delete'
  })
}

// 导出子场景信息
export function exportSubtreasury(query) {
  return request({
    url: '/scene/subtreasury/export',
    method: 'get',
    params: query
  })
}

// 查询子场景信息列表
export function listByChannel(channelId) {
  return request({
    url: '/scene/subtreasury/listByChannel/'+channelId,
    method: 'get'
  })
}

