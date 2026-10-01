import request from '@/utils/request'

// 查询接口交易请求记录列表
export function listReqrecord(query) {
  return request({
    url: '/tradelog/reqrecord/list',
    method: 'get',
    params: query
  })
}

// 查询接口交易请求记录详细
export function getReqrecord(id) {
  return request({
    url: '/tradelog/reqrecord/' + id,
    method: 'get'
  })
}
