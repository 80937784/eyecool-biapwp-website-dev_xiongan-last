import request from '@/utils/request'

// 查询个人考勤记录详情列表
export function listReport(query) {
  return request({
    url: '/attendance/report/list',
    method: 'get',
    params: query
  })
}

// 查询个人考勤记录详情详细
export function getReport(id) {
  return request({
    url: '/attendance/report/' + id,
    method: 'get'
  })
}

// 新增个人考勤记录详情
export function addReport(data) {
  return request({
    url: '/attendance/report',
    method: 'post',
    data: data
  })
}

// 修改个人考勤记录详情
export function updateReport(data) {
  return request({
    url: '/attendance/report',
    method: 'put',
    data: data
  })
}

// 删除个人考勤记录详情
export function delReport(id) {
  return request({
    url: '/attendance/report/' + id,
    method: 'delete'
  })
}

// 导出个人考勤记录详情
export function exportReport(query) {
  return request({
    url: '/attendance/report/export',
    method: 'get',
    params: query
  })
}