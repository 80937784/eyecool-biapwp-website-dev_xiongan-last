import request from '@/utils/request'

// 查询人员证件信息列表
export function listCert(query) {
  return request({
    url: '/basedata/cert/list',
    method: 'get',
    params: query
  })
}

// 查询人员证件信息详细
export function getCert(id) {
  return request({
    url: '/basedata/cert/' + id,
    method: 'get'
  })
}

// 新增人员证件信息
export function addCert(data) {
  return request({
    url: '/basedata/cert',
    method: 'post',
    data: data
  })
}

// 修改人员证件信息
export function updateCert(data) {
  return request({
    url: '/basedata/cert',
    method: 'put',
    data: data
  })
}

// 删除人员证件信息
export function delCert(id) {
  return request({
    url: '/basedata/cert/' + id,
    method: 'delete'
  })
}

// 导出人员证件信息
export function exportCert(query) {
  return request({
    url: '/basedata/cert/export',
    method: 'get',
    params: query
  })
}

// 下载导入模板
export function importTemplate() {
  return request({
    url: '/basedata/cert/importTemplate',
    method: 'get'
  })
}

// 下载人员证件照
export function downloadCert(query) {
  return request({
    url: '/basedata/cert/download',
    method: 'get',
    params: query
  })
}