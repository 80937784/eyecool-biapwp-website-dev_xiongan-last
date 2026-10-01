import request from '@/utils/request'

// 查询部门考勤规则列表
export function listRule(query) {
  return request({
    url: '/attendance/rule/list',
    method: 'get',
    params: query
  })
}

// 查询部门考勤规则详细
export function getRule(id) {
  return request({
    url: '/attendance/rule/' + id,
    method: 'get'
  })
}


export function getRuleAllList() {
  return request({
    url: '/attendance/rule/getRuleAllList' ,
    method: 'get'
  })
}
export function initDeptAllList() {
  return request({
    url: '/attendance/rule/initDeptAllList' ,
    method: 'get'
  })
}


// 新增部门考勤规则
export function addRule(data) {
  return request({
    url: '/attendance/rule',
    method: 'post',
    data: data
  })
}

// 修改部门考勤规则
export function updateRule(data) {
  return request({
    url: '/attendance/rule',
    method: 'put',
    data: data
  })
}

// 删除部门考勤规则
export function delRule(id) {
  return request({
    url: '/attendance/rule/' + id,
    method: 'delete'
  })
}

// 导出部门考勤规则
export function exportRule(query) {
  return request({
    url: '/attendance/rule/export',
    method: 'get',
    params: query
  })
}