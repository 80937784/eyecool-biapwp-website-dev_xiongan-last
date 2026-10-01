import request from '@/utils/request'

// 查询区域列表
export function listModel(query) {
  return request({
    url: '/area/model/list',
    method: 'get',
    params: query
  })
}


// 查询区域列表（排除节点）
export function listModelExcludeChild(id) {
  return request({
    url: '/area/model/list/exclude/' + id,
    method: 'get'
  })
}


// 查询区域详细
export function getModel(id) {
  return request({
    url: '/area/model/' + id,
    method: 'get'
  })
}

// 新增区域
export function addModel(data) {
  return request({
    url: '/area/model',
    method: 'post',
    data: data
  })
}

// 修改区域
export function updateModel(data) {
  return request({
    url: '/area/model',
    method: 'put',
    data: data
  })
}

// 删除区域
export function delModel(id) {
  return request({
    url: '/area/model/' + id,
    method: 'delete'
  })
}

// 导出区域
export function exportModel(query) {
  return request({
    url: '/area/model/export',
    method: 'get',
    params: query
  })
}

// 查询区域下拉树结构
export function treeselect(query) {
  return request({
    url: '/area/model/treeselect',
    method: 'get',
    params: query
  })
}