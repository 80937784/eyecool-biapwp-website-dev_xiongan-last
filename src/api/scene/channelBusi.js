import request from '@/utils/request'

// 查询场景业务列表
export function listChannelBusi(query) {
  return request({
    url: '/scene/channelBusi/list',
    method: 'get',
    params: query
  })
}

// 查询场景业务详细
export function getChannelBusi(id) {
  return request({
    url: '/scene/channelBusi/' + id,
    method: 'get'
  })
}

// 新增场景业务
export function addChannelBusi(data) {
  return request({
    url: '/scene/channelBusi',
    method: 'post',
    data: data
  })
}

// 修改场景业务
export function updateChannelBusi(data) {
  return request({
    url: '/scene/channelBusi',
    method: 'put',
    data: data
  })
}

// 删除场景业务
export function delChannelBusi(id) {
  return request({
    url: '/scene/channelBusi/' + id,
    method: 'delete'
  })
}

// 导出场景业务
export function exportChannelBusi(query) {
  return request({
    url: '/scene/channelBusi/export',
    method: 'get',
    params: query
  })
}


// 查询未绑定到场景库的人员
export function listChannelUnBindPerson(channelId, query) {
  return request({
    url: '/scene/channelBusi/listUnBindPerson/'+channelId,
    method: 'get',
    params: query
  })
}

// 下载导入模板
export function importTemplate() {
  return request({
    url: '/scene/channelBusi/importTemplate',
    method: 'get'
  })
}

// 同步人员信息到datamanager
export function syncdata(data) {
  return request({
    url: '/scene/channelBusi/syncdata',
    method: 'post',
    data: data
  })
}