import request from '@/utils/request'

// 查询升级任务列表
export function listUpgradeTask(query) {
  return request({
    url: '/device/upgradeTask/list',
    method: 'get',
    params: query
  })
}

// 查询升级任务详细
export function getUpgradeTask(id) {
  return request({
    url: '/device/upgradeTask/' + id,
    method: 'get'
  })
}

// 新增升级任务
export function addUpgradeTask(data) {
  return request({
    url: '/device/upgradeTask',
    method: 'post',
    data: data
  })
}

// 修改升级任务
export function updateUpgradeTask(data) {
  return request({
    url: '/device/upgradeTask',
    method: 'put',
    data: data
  })
}

// 删除升级任务
export function delUpgradeTask(id) {
  return request({
    url: '/device/upgradeTask/' + id,
    method: 'delete'
  })
}

// 导出升级任务
export function exportUpgradeTask(query) {
  return request({
    url: '/device/upgradeTask/export',
    method: 'get',
    params: query
  })
}
// 发布
export function publishTask(id) {
  return request({
    url: '/device/upgradeTask/publish/' + id,
    method: 'post'
  })
}