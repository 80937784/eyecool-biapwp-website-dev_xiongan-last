import request from '@/utils/request'

// 查询场景参数列表
export function listChannelParam(query) {
  return request({
    url: '/scene/channelParam/list',
    method: 'get',
    params: query
  })
}

// 查询场景参数详细
export function getChannelParam(id) {
  return request({
    url: '/scene/channelParam/' + id,
    method: 'get'
  })
}

// 新增场景参数
export function addChannelParam(data) {
  return request({
    url: '/scene/channelParam',
    method: 'post',
    data: data
  })
}

// 修改场景参数
export function updateChannelParam(data) {
  return request({
    url: '/scene/channelParam',
    method: 'put',
    data: data
  })
}

// 删除场景参数
export function delChannelParam(id) {
  return request({
    url: '/scene/channelParam/' + id,
    method: 'delete'
  })
}

// 导出场景参数
export function exportChannelParam(query) {
  return request({
    url: '/scene/channelParam/export',
    method: 'get',
    params: query
  })
}


// 查询场景参数Key列表
export function keyList(query) {
  return request({
    url: '/scene/channelParam/keyList',
    method: 'get',
    params: query
  })
}