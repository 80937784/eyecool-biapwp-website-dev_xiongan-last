import request from '@/utils/request'

// 查询升级日志列表
export function listUpgradelog(query) {
  return request({
    url: '/device/upgradelog/list',
    method: 'get',
    params: query
  })
}

// 查询升级日志详细
export function getUpgradelog(id) {
  return request({
    url: '/device/upgradelog/' + id,
    method: 'get'
  })
}

// 导出升级日志
export function exportUpgradelog(query) {
  return request({
    url: '/device/upgradelog/export',
    method: 'get',
    params: query
  })
}