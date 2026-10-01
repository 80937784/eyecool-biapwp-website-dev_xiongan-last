import request from '@/utils/request'

// 查询设备型号信息列表
export function listModel(query) {
  return request({
    url: '/device/model/list',
    method: 'get',
    params: query
  })
}

// 查询设备型号信息详细
export function getModel(id) {
  return request({
    url: '/device/model/' + id,
    method: 'get'
  })
}

// 新增设备型号信息
export function addModel(data) {
  return request({
    url: '/device/model',
    method: 'post',
    data: data
  })
}

// 修改设备型号信息
export function updateModel(data) {
  return request({
    url: '/device/model',
    method: 'put',
    data: data
  })
}

// 删除设备型号信息
export function delModel(id) {
  return request({
    url: '/device/model/' + id,
    method: 'delete'
  })
}

// 导出设备型号信息
export function exportModel(query) {
  return request({
    url: '/device/model/export',
    method: 'get',
    params: query
  })
}

// 查询所有设备型号信息列表
export function listAllModel() {
  return request({
    url: '/device/model/listAll',
    method: 'get'
  })
}