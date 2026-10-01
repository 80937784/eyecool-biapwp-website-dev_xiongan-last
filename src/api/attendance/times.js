import request from '@/utils/request'

// 查询考勤时间段列表
export function listTimes(query) {
  return request({
    url: '/attendance/times/list',
    method: 'get',
    params: query
  })
}

// 查询考勤时间段详细
export function getTimes(id) {
  return request({
    url: '/attendance/times/' + id,
    method: 'get'
  })
}

// 新增考勤时间段
export function addTimes(data) {
  return request({
    url: '/attendance/times',
    method: 'post',
    data: data
  })
}

// 修改考勤时间段
export function updateTimes(data) {
  return request({
    url: '/attendance/times',
    method: 'put',
    data: data
  })
}

// 删除考勤时间段
export function delTimes(id) {
  return request({
    url: '/attendance/times/' + id,
    method: 'delete'
  })
}

// 导出考勤时间段
export function exportTimes(query) {
  return request({
    url: '/attendance/times/export',
    method: 'get',
    params: query
  })
}