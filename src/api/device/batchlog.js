import request from '@/utils/request'

// 查询设备批次列表
export function listBatchlog(query) {
  return request({
    url: '/device/batchlog/list',
    method: 'get',
    params: query
  })
}

// 查询设备批次详细
export function getBatchlog(id) {
  return request({
    url: '/device/batchlog/' + id,
    method: 'get'
  })
}

// 设备批次回滚
export function rollbackBatch(batchNum) {
  return request({
    url: '/device/batchlog/rollback/' + batchNum,
    method: 'delete'
  })
}

// 导出设备批次
export function exportBatchlog(query) {
  return request({
    url: '/device/batchlog/export',
    method: 'get',
    params: query
  })
}