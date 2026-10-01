import request from '@/utils/request'
// 指静脉列表
export function getFingerVeinList(query) {
    return request({
      url: '/basedata/fingerVein/list',
      method: 'get',
      params: query
    })
  }
// 指静脉删除
export function delFingerVeinList(ids) {
  return request({
    url: '/basedata/fingerVein/'+ids,
    method: 'delete'
  })
}
  