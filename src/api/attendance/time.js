import request from '@/utils/request'

// 查询每个考勤规则对应的详情时间段信息列表
export function listTime(query) {
  return request({
    url: '/attendance/time/list',
    method: 'get',
    params: query
  })
}

// 查询每个考勤规则对应的详情时间段信息详细
export function getTime(id) {
  return request({
    url: '/attendance/time/' + id,
    method: 'get'
  })
}

// 新增每个考勤规则对应的详情时间段信息
export function addTime(data) {
  return request({
    url: '/attendance/time',
    method: 'post',
    data: data
  })
}

// 修改每个考勤规则对应的详情时间段信息
export function updateTime(data) {
  return request({
    url: '/attendance/time',
    method: 'put',
    data: data
  })
}

// 删除每个考勤规则对应的详情时间段信息
export function delTime(id) {
  return request({
    url: '/attendance/time/' + id,
    method: 'delete'
  })
}

// 导出每个考勤规则对应的详情时间段信息
export function exportTime(query) {
  return request({
    url: '/attendance/time/export',
    method: 'get',
    params: query
  })
}