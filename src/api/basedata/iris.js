import request from '@/utils/request'

// 查询虹膜图像信息列表
export function listIris(query) {
  return request({
    url: '/basedata/iris/list',
    method: 'get',
    params: query
  })
}

// 查询虹膜图像信息详细
export function getIris(id) {
  return request({
    url: '/basedata/iris/' + id,
    method: 'get'
  })
}

// 新增虹膜图像信息
export function addIris(data) {
  return request({
    url: '/basedata/iris',
    method: 'post',
    data: data
  })
}

// 修改虹膜图像信息
export function updateIris(data) {
  return request({
    url: '/basedata/iris',
    method: 'put',
    data: data
  })
}

// 删除虹膜图像信息
export function delIris(id) {
  return request({
    url: '/basedata/iris/' + id,
    method: 'delete'
  })
}

// 导出虹膜图像信息
export function exportIris(query) {
  return request({
    url: '/basedata/iris/export',
    method: 'get',
    params: query
  })
}


// 一键更新虹膜特征
export function updateIrisFeature(data) {
  return request({
    url: '/basedata/iris/updatefeature',
    method: 'put',
    data: data
  })
}

// 下载图片
export function downloadImages(query) {
  return request({
    url: '/basedata/iris/download',
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