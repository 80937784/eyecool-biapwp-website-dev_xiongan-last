import request from '@/utils/request'

// 查询场景信息列表
export function listChannel(query) {
  return request({
    url: '/scene/channel/list',
    method: 'get',
    params: query
  })
}

// 查询场景信息详细
export function getChannel(id) {
  return request({
    url: '/scene/channel/' + id,
    method: 'get'
  })
}

// 新增场景信息
export function addChannel(data) {
  return request({
    url: '/scene/channel',
    method: 'post',
    data: data
  })
}

// 修改场景信息
export function updateChannel(data) {
  return request({
    url: '/scene/channel',
    method: 'put',
    data: data
  })
}

// 删除场景信息
export function delChannel(id) {
  return request({
    url: '/scene/channel/' + id,
    method: 'delete'
  })
}

// 导出场景信息
export function exportChannel(query) {
  return request({
    url: '/scene/channel/export',
    method: 'get',
    params: query
  })
}

// 查询场景信息列表
export function listAllChannel(query) {
  return request({
    url: '/scene/channel/listAll',
    method: 'get',
    params: query
  })
}

// 查询总场景
export function searchList(query) {
  return request({
    url:'/scene/channel/treeList',
    method:'get',
    params: query
  })
}