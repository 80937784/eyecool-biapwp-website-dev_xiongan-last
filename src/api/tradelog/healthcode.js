import request from '@/utils/request'

// 查询健康码请求列表
export function listHealthcode(query) {
  return request({
    url: '/tradelog/healthcode/list',
    method: 'get',
    params: query
  })
}

// 查询健康码请求详细
export function getHealthcode(id) {
  return request({
    url: '/tradelog/healthcode/' + id,
    method: 'get'
  })
}

// 导出健康码请求
export function exportHealthcode(query) {
  return request({
    url: '/tradelog/healthcode/export',
    method: 'get',
    params: query
  })
}