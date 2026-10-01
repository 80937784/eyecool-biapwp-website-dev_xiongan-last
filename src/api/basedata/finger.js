import request from '@/utils/request'

// 查询指纹图像信息列表
export function listFinger(query) {
  return request({
    url: '/basedata/finger/list',
    method: 'get',
    params: query
  })
}

// 查询指纹图像信息详细
export function getFinger(id) {
  return request({
    url: '/basedata/finger/' + id,
    method: 'get'
  })
}

// 新增指纹图像信息
export function addFinger(data) {
  return request({
    url: '/basedata/finger',
    method: 'post',
    data: data
  })
}

// 修改指纹图像信息
export function updateFinger(data) {
  return request({
    url: '/basedata/finger',
    method: 'put',
    data: data
  })
}

// 删除指纹图像信息
export function delFinger(id) {
  return request({
    url: '/basedata/finger/' + id,
    method: 'delete'
  })
}

// 导出指纹图像信息
export function exportFinger(query) {
  return request({
    url: '/basedata/finger/export',
    method: 'get',
    params: query
  })
}

// 一键更新指纹特征
export function updateFingerFeature(data) {
  return request({
    url: '/basedata/finger/updatefeature',
    method: 'put',
    data: data
  })
}

// 下载图片
export function downloadImages(query) {
  return request({
    url: '/basedata/finger/download',
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