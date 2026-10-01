import request from '@/utils/request'

// 查询钉钉团队(企业)列表
export function listDingTeam(query) {
  return request({
    url: '/msg/dingTeam/list',
    method: 'get',
    params: query
  })
}

// 查询钉钉团队(企业)详细
export function getDingTeam(id) {
  return request({
    url: '/msg/dingTeam/' + id,
    method: 'get'
  })
}

// 新增钉钉团队(企业)
export function addDingTeam(data) {
  return request({
    url: '/msg/dingTeam',
    method: 'post',
    data: data
  })
}

// 修改钉钉团队(企业)
export function updateDingTeam(data) {
  return request({
    url: '/msg/dingTeam',
    method: 'put',
    data: data
  })
}

// 删除钉钉团队(企业)
export function delDingTeam(id) {
  return request({
    url: '/msg/dingTeam/' + id,
    method: 'delete'
  })
}

// 导出钉钉团队(企业)
export function exportDingTeam(query) {
  return request({
    url: '/msg/dingTeam/export',
    method: 'get',
    params: query
  })
}

// 查询所有钉钉团队(企业)列表
export function listAllDingTeam(query) {
  return request({
    url: '/msg/dingTeam/listAll',
    method: 'get',
    params: query
  })
}