import request from '@/utils/request'

// 查询访客信息
export function listVisitor(query) {
    return request({
      url: '/basedata/visitor/list',
      method: 'get',
      params: query
    })
}
// 搜索邀请人接口
export function listByUidOrName(name) {
    return request({
      url: '/basedata/visitor/listByUidOrName',
      method: 'get',
      params: {
          name
      }
    })
  }
  // 删除访客
export function deleteVisitor(ids) {
    return request({
      url: '/basedata/visitor/' + ids,
      method: 'delete'
    })
  }
    // 访客详情
export function visitorDetail(id) {
  return request({
    url: '/basedata/visitor/'+id,
    method: 'get'
  })
}
    // 访客二维码展示
    export function qrCodeGen() {
      return request({
        url: '/basedata/visitor/qrCodeGen',
        method: 'get'
      })
    }
     // 下载二维码
     export function downloadQrCode() {
      return request({
        url: '/basedata/visitor/downloadQrCode',
        method: 'get'
      })
    }
    // 
    export function faceListVisitor(query) {
      return request({
        url: '/basedata/visitor/face/list',
        method: 'get',
        params: query
      })
  }
      // 访客详情
export function visitorFacreDetail(id) {
  return request({
    url: '/basedata/visitor/face/'+id,
    method: 'get'
  })
}
  
    