import request from '@/utils/request'
// 获取场景编码
export function getSceneCode() {
    return request({
        url: '/scene/channel/genSceneCode',
        method: 'get'
      })
}
// 获取子场景编码
export function getSubsceneCode(id) {
    return request({
        url: '/scene/subtreasury/genSubsceneCode/' + id,
        method: 'get'
      })
}
// 新增子场景信息
export function addSubtreasury(data) {
    return request({
      url: '/scene/subtreasury',
      method: 'post',
      data: data
    })
  }
// 查询子场景信息详细
export function getSubtreasury(id) {
  return request({
    url: '/scene/subtreasury/' + id,
    method: 'get'
  })
}
// 查询子场景信息详细
export function getChannel(id) {
  return request({
    url: '/scene/channel/' + id,
    method: 'get'
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
// 修改子场景信息
export function updateSubtreasury(data) {
  return request({
    url: '/scene/subtreasury',
    method: 'put',
    data: data
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
// 新增场景信息
export function addChannel(data) {
  return request({
    url: '/scene/channel',
    method: 'post',
    data: data
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
// 清空子场景数据
export function clearSubData(subIds) {
  return request({
    url: '/scene/subtreasuryBusi/clearSubData/'+subIds,
    method: 'delete'
  })
}
// 查询子场景信息列表
export function listByChannel(channelId) {
  return request({
    url: '/scene/subtreasury/listByChannel/'+channelId,
    method: 'get'
  })
}
