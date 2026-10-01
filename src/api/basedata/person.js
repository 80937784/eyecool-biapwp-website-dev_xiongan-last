import request from '@/utils/request'

// 查询人员基础信息列表
export function listPerson(query) {
  return request({
    url: '/basedata/person/list',
    method: 'get',
    params: query
  })
}

// 查询人员基础信息详细
export function getPerson(id) {
  return request({
    url: '/basedata/person/' + id,
    method: 'get'
  })
}

// 新增人员基础信息
export function addPerson(data) {
  return request({
    url: '/basedata/person',
    method: 'post',
    data: data
  })
}

// 修改人员基础信息
export function updatePerson(data) {
  return request({
    url: '/basedata/person',
    method: 'put',
    data: data
  })
}

// 删除人员基础信息
export function delPerson(id) {
  return request({
    url: '/basedata/person/' + id,
    method: 'delete'
  })
}

// 导出人员基础信息
export function exportPerson(query) {
  return request({
    url: '/basedata/person/export',
    method: 'get',
    params: query
  })
}

// 下载导入模板
export function importTemplate() {
  return request({
    url: '/basedata/person/importTemplate',
    method: 'get'
  })
}

// 同步人员信息到datamanager
export function syncdata(data) {
  return request({
    url: '/basedata/person/syncdata',
    method: 'post',
    data: data
  })
}
// 查询唯一uniqueId
export function getUniqueId(query) {
  return request({
    url: '/basedata/person/listByUidOrName',
    method: 'get',
    params: query
  })
}

export function changeStatus(id,params) {
  return request({
    url: '/basedata/person/isStopAndEnable/' + id,
    method: 'get',
    params
  })
}

// 查询场景列表
export function listChannel(query) {
  return request({
    url: '/basedata/person/listChannel',
    method: 'get',
    params: query
  })
}