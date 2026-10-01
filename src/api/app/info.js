import request from '@/utils/request'

// 查询应用系统信息列表
export function listInfo(query) {
  return request({
    url: '/app/info/list',
    method: 'get',
    params: query
  })
}

// 查询应用系统信息详细
export function getInfo(id) {
  return request({
    url: '/app/info/' + id,
    method: 'get'
  })
}

// 新增应用系统信息
export function addInfo(data) {
  return request({
    url: '/app/info',
    method: 'post',
    data: data
  })
}

// 删除应用系统信息
export function delInfo(id) {
  return request({
    url: '/app/info/' + id,
    method: 'delete'
  })
}

// 导出应用系统信息
export function exportInfo(query) {
  return request({
    url: '/app/info/export',
    method: 'get',
    params: query
  })
}


// 查询所有应用系统信息列表
export function listAllInfo(query) {
  return request({
    url: '/app/info/listAll',
    method: 'get',
    params: query
  })
}