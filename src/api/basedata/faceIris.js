import request from '@/utils/request'

// 查询虹膜人脸多模态列表
export function listFaceIris(query) {
  return request({
    url: '/basedata/faceIris/list',
    method: 'get',
    params: query
  })
}

// 查询虹膜人脸多模态详细
export function getFaceIris(id) {
  return request({
    url: '/basedata/faceIris/' + id,
    method: 'get'
  })
}

// 新增虹膜人脸多模态
export function addFaceIris(data) {
  return request({
    url: '/basedata/faceIris',
    method: 'post',
    data: data
  })
}

// 修改虹膜人脸多模态
export function updateFaceIris(data) {
  return request({
    url: '/basedata/faceIris',
    method: 'put',
    data: data
  })
}

// 删除虹膜人脸多模态
export function delFaceIris(id) {
  return request({
    url: '/basedata/faceIris/' + id,
    method: 'delete'
  })
}

// 导出虹膜人脸多模态
export function exportFaceIris(query) {
  return request({
    url: '/basedata/faceIris/export',
    method: 'get',
    params: query
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