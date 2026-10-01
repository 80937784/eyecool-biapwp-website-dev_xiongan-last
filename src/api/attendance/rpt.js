import request from '@/utils/request'

// 查询个人考勤记录标识列表
export function listRpt(query) {
  return request({
    url: '/attendance/rpt/list',
    method: 'get',
    params: query
  })
}

//查询每个人某段时间内的报表情况
export function listRptEveryOne(query) {
  return request({
    url: '/attendance/rpt/lisEveryOnet',
    method: 'get',
    params: query
  })
}
//查询每个人某段时间内的报表情况
export function listRptDept(query) {
  return request({
    url: '/attendance/rpt/lisDeptRate',
    method: 'get',
    params: query
  })
}


// 查询个人考勤记录标识详细
export function getRpt(id) {
  return request({
    url: '/attendance/rpt/' + id,
    method: 'get'
  })
}

// 新增个人考勤记录标识
export function addRpt(data) {
  return request({
    url: '/attendance/rpt',
    method: 'post',
    data: data
  })
}

// 修改个人考勤记录标识
export function updateRpt(data) {
  return request({
    url: '/attendance/rpt',
    method: 'put',
    data: data
  })
}

// 删除个人考勤记录标识
export function delRpt(id) {
  return request({
    url: '/attendance/rpt/' + id,
    method: 'delete'
  })
}

// 导出个人考勤记录标识
export function exportRpt(query) {
  debugger;
  return request({
    url: '/attendance/rpt/export',
    method: 'get',
    params: query
  })
}
// 导出个人考勤率记录标识
export function exportRptEveryOne(query) {
  return  request({
    url: '/attendance/rpt/exportEveryOne',
    method: 'get',
    params: query
  })
}
// 导出部门考勤率记录标识
export function exportDeptRate(query) {
  return  request({
    url: '/attendance/rpt/exportDeptRate',
    method: 'get',
    params: query
  })
}

