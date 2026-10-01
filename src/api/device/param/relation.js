import request from '@/utils/request'

// 查询参数型号关系列表
export function listParamModelRel(query) {
  return request({
    url: '/device/paramModelRel/list',
    method: 'get',
    params: query
  })
}

// 查询参数型号关系详细
export function getParamModelRel(id) {
  return request({
    url: '/device/paramModelRel/' + id,
    method: 'get'
  })
}

// 新增参数型号关系
export function addParamModelRel(data) {
  return request({
    url: '/device/paramModelRel',
    method: 'post',
    data: data
  })
}

// 修改参数型号关系
export function updateParamModelRel(data) {
  return request({
    url: '/device/paramModelRel',
    method: 'put',
    data: data
  })
}

// 删除参数型号关系
export function delParamModelRel(id) {
  return request({
    url: '/device/paramModelRel/' + id,
    method: 'delete'
  })
}

// 导出参数型号关系
export function exportParamModelRel(query) {
  return request({
    url: '/device/paramModelRel/export',
    method: 'get',
    params: query
  })
}

// 查询所有参数型号关系
export function listAllParamModelRel(deviceMdeviceMmodelCode) {
  return request({
    url: '/device/paramModelRel/listAll/' + deviceMdeviceMmodelCode,
    method: 'get'
  })
}