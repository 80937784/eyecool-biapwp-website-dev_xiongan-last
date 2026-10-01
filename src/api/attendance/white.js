import request from '@/utils/request'

// 查询记录白名单人员列表
export function listWhite(query) {
  return request({
    url: '/attendance/white/list',
    method: 'get',
    params: query
  })
}

// 查询记录不是白名单人员列表
export function listNoWhite(query) {
  return request({
    url: '/attendance/white/noWhite/list',
    method: 'get',
    params: query
  })
}

// 查询记录白名单人员详细
export function getWhite(id) {
  return request({
    url: '/attendance/white/' + id,
    method: 'get'
  })
}

// 新增记录白名单人员
export function addWhite(data) {
  return request({
    url: '/attendance/white',
    method: 'post',
    data: data
  })
}

// 修改记录白名单人员
export function updateWhite(data) {
  return request({
    url: '/attendance/white',
    method: 'put',
    data: data
  })
}

// 删除记录白名单人员
export function delWhite(id) {
  return request({
    url: '/attendance/white/' + id,
    method: 'delete'
  })
}

// 导出记录白名单人员
export function exportWhite(query) {
  return request({
    url: '/attendance/white/export',
    method: 'get',
    params: query
  })
}
  // 导入白名单
export function importWhitePerson(data) {
  return request({
    url: '/attendance/white/importWhitePerson',
    method: 'post',
    params: data
  })
}
