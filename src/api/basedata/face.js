import request from '@/utils/request'

// 查询人脸图像信息列表
export function listFace(query) {
  return request({
    url: '/basedata/face/list',
    method: 'get',
    params: query
  })
}

// 查询人脸图像信息详细
export function getFace(id) {
  return request({
    url: '/basedata/face/' + id,
    method: 'get'
  })
}

// 新增人脸图像信息
export function addFace(data) {
  return request({
    url: '/basedata/face',
    method: 'post',
    data: data
  })
}

// 修改人脸图像信息
export function updateFace(data) {
  return request({
    url: '/basedata/face',
    method: 'put',
    data: data
  })
}

// 删除人脸图像信息
export function delFace(id) {
  return request({
    url: '/basedata/face/' + id,
    method: 'delete'
  })
}

// 导出人脸图像信息
export function exportFace(query) {
  return request({
    url: '/basedata/face/export',
    method: 'get',
    params: query
  })
}

// 一键更新人脸特征
export function updateFaceFeature(data) {
  return request({
    url: '/basedata/face/updatefeature',
    method: 'put',
    data: data
  })
}

// 下载图片
export function downloadImages(query) {
  return request({
    url: '/basedata/face/download',
    method: 'get',
    params: query,
    timeout:0
  })
}
// 查询唯一uniqueId
export function getUniqueId(query) {
  return request({
    url: '/basedata/person/listByUidOrName',
    method: 'get',
    params: query
  })
}