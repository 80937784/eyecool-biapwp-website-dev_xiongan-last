import request from '@/utils/request'

// 查询应用接口授权列表
export function listAuth(query) {
  return request({
    url: '/app/auth/list',
    method: 'get',
    params: query
  })
}

// 查询应用接口授权详细
export function getAuth(id) {
  return request({
    url: '/app/auth/' + id,
    method: 'get'
  })
}

// 新增应用接口授权
export function addAuth(data) {
  return request({
    url: '/app/auth',
    method: 'post',
    data: data
  })
}

// 修改应用接口授权
export function updateAuth(data) {
  return request({
    url: '/app/auth',
    method: 'put',
    data: data
  })
}

// 删除应用接口授权
export function delAuth(id) {
  return request({
    url: '/app/auth/' + id,
    method: 'delete'
  })
}

// 导出应用接口授权
export function exportAuth(query) {
  return request({
    url: '/app/auth/export',
    method: 'get',
    params: query
  })
}



// 查询应用接口授权列表
export function listTenantInteraface() {
  return request({
    url: '/app/auth/listTenantInteraface',
    method: 'get'
  })
}