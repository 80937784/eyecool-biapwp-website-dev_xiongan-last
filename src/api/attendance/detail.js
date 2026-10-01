import request from '@/utils/request'

// 查询每个考勤规则对应的详情列表
export function listDetail(query) {
  return request({
    url: '/attendance/detail/list',
    method: 'get',
    params: query
  })
}

// 查询每个考勤规则对应的详情详细
export function getDetail(id) {
  return request({
    url: '/attendance/detail/' + id,
    method: 'get'
  })
}

// 新增每个考勤规则对应的详情
export function addDetail(data) {
  return request({
    url: '/attendance/detail',
    method: 'post',
    data: data
  })
}

// 修改每个考勤规则对应的详情
export function updateDetail(data) {
  return request({
    url: '/attendance/detail',
    method: 'put',
    data: data
  })
}

// 删除每个考勤规则对应的详情
export function delDetail(id) {
  return request({
    url: '/attendance/detail/' + id,
    method: 'delete'
  })
}

// 导出每个考勤规则对应的详情
export function exportDetail(query) {
  return request({
    url: '/attendance/detail/export',
    method: 'get',
    params: query
  })
}