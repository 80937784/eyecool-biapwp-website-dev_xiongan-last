import request from '@/utils/request'

// 查询子场景业务列表
export function listSubtreasuryBusi(query) {
  return request({
    url: '/scene/subtreasuryBusi/list',
    method: 'get',
    params: query
  })
}

// 查询子场景业务详细
export function getSubtreasuryBusi(id) {
  return request({
    url: '/scene/subtreasuryBusi/' + id,
    method: 'get'
  })
}

// 新增子场景业务
export function addSubtreasuryBusi(data) {
  return request({
    url: '/scene/subtreasuryBusi',
    method: 'post',
    data: data
  })
}

// 修改子场景业务
export function updateSubtreasuryBusi(data) {
  return request({
    url: '/scene/subtreasuryBusi',
    method: 'put',
    data: data
  })
}

// 删除子场景业务
export function delSubtreasuryBusi(id) {
  return request({
    url: '/scene/subtreasuryBusi/' + id,
    method: 'delete'
  })
}

// 导出子场景业务
export function exportSubtreasuryBusi(query) {
  return request({
    url: '/scene/subtreasuryBusi/export',
    method: 'get',
    params: query
  })
}

// 查询未绑定到子场景的人员
export function listSubUnBindPerson(subtreasuryId, query) {
  return request({
    url: '/scene/subtreasuryBusi/listUnBindPerson/'+subtreasuryId,
    method: 'get',
    params: query
  })
}


// 同步人员信息到datamanager
export function syncdata(data) {
  return request({
    url: '/scene/subtreasuryBusi/syncdata',
    method: 'post',
    data: data
  })
}


// 清空子场景数据
export function clearSubData(subIds) {
  return request({
    url: '/scene/subtreasuryBusi/clearSubData/'+subIds,
    method: 'delete'
  })
}