import request from '@/utils/request'

// 查询设备参数信息列表
export function listParam(query) {
  return request({
    url: '/device/paraminfo/list',
    method: 'get',
    params: query
  })
}

// 查询设备参数信息详细
export function getParam(id) {
  return request({
    url: '/device/paraminfo/' + id,
    method: 'get'
  })
}

// 新增设备参数信息
export function addParam(data) {
  return request({
    url: '/device/paraminfo',
    method: 'post',
    data: data
  })
}

// 修改设备参数信息
export function updateParam(data) {
  return request({
    url: '/device/paraminfo',
    method: 'put',
    data: data
  })
}

// 删除设备参数信息
export function delParam(id) {
  return request({
    url: '/device/paraminfo/' + id,
    method: 'delete'
  })
}

// 导出设备参数信息
export function exportParam(query) {
  return request({
    url: '/device/paraminfo/export',
    method: 'get',
    params: query
  })
}


// 查询所有参数信息列表
export function listAllParamInfo(modelCode) {
  return request({
    url: '/device/paraminfo/listAll/excludeModel/'+modelCode,
    method: 'get'
  })
}