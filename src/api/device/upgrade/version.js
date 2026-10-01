import request from '@/utils/request'

// 查询版本信息列表
export function listVersion(query) {
  return request({
    url: '/device/upgrade/version/list',
    method: 'get',
    params: query
  })
}

// 查询版本信息详细
export function getVersion(id) {
  return request({
    url: '/device/upgrade/version/' + id,
    method: 'get'
  })
}

// 修改版本信息
export function updateVersion(data) {
  return request({
    url: '/device/upgrade/version',
    method: 'put',
    data: data
  })
}

// 删除版本信息
export function delVersion(id) {
  return request({
    url: '/device/upgrade/version/' + id,
    method: 'delete'
  })
}

// 导出版本信息
export function exportVersion(query) {
  return request({
    url: '/device/upgrade/version/export',
    method: 'get',
    params: query
  })
}

// 查询所有版本信息列表
export function listAllVersion(query) {
  return request({
    url: '/device/upgrade/version/listAll',
    method: 'get',
    params: query
  })
}