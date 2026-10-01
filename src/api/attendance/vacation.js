import request from '@/utils/request'

// 查询假期管理列表
export function listVacation(query) {
  return request({
    url: '/attendance/vacation/list',
    method: 'get',
    params: query
  })
}

// 查询假期管理详细
export function getVacation(id) {
  return request({
    url: '/attendance/vacation/' + id,
    method: 'get'
  })
}

// 新增假期管理
export function addVacation(data) {
  return request({
    url: '/attendance/vacation',
    method: 'post',
    data: data
  })
}

// 修改假期管理
export function updateVacation(data) {
  return request({
    url: '/attendance/vacation',
    method: 'put',
    data: data
  })
}

// 删除假期管理
export function delVacation(id) {
  return request({
    url: '/attendance/vacation/' + id,
    method: 'delete'
  })
}

// 导出假期管理
export function exportVacation(query) {
  return request({
    url: '/attendance/vacation/export',
    method: 'get',
    params: query
  })
}