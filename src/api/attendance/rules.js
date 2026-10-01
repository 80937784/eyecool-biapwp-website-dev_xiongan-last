import request from '@/utils/request'

// 查询考勤规则列表
export function listRules(query) {
  return request({
    url: '/attendance/rules/list',
    method: 'get',
    params: query
  })
}

// 查询考勤规则详细
export function getRules(id) {
  return request({
    url: '/attendance/rules/' + id,
    method: 'get'
  })
}

// 查询考勤规则详细
export function getRulesAllTimesSetting() {
  return request({
    url: '/attendance/times/getAllTimesSetting',
    method: 'get'
  })
}

export function updateSmartMode(id,smartMode) {
  debugger;
  return request({
    url: '/attendance/rules/updateSmartMode/' + id+"/"+smartMode,
    method: 'get'
  })
}

// 新增考勤规则
export function addRules(data) {
  return request({
    url: '/attendance/rules',
    method: 'post',
    data: data
  })
}

// 修改考勤规则
export function updateRules(data) {
  return request({
    url: '/attendance/rules',
    method: 'put',
    data: data
  })
}

// 删除考勤规则
export function delRules(id) {
  return request({
    url: '/attendance/rules/' + id,
    method: 'delete'
  })
}

// 导出考勤规则
export function exportRules(query) {
  return request({
    url: '/attendance/rules/export',
    method: 'get',
    params: query
  })
}