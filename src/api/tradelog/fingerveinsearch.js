import request from '@/utils/request'
// 指静脉列表
export function getFingerVeinList(query) {
    return request({
      url: '/tradelog/fingerVeinSearch/list',
      method: 'get',
      params: query
    })
  }
  // 指静脉详情
export function getFingerVeinListDetail(id) {
  return request({
    url: '/tradelog/fingerVeinSearch/'+id,
    method: 'get'
  })
}
    // 导出指静脉
export function exprotFingerVein() {
  return request({
    url: '/tradelog/fingerVeinSearch/export'
  })
}