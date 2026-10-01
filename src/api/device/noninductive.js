import request from '@/utils/request'

// 查询设备信息列表
export function listInfo(query) {
    return request({
        url: '/device/noninductive/list',
        method: 'get',
        params: query
    })
}

// 查询设备信息详细
export function getInfo(id) {
    return request({
        url: '/device/noninductive/' + id,
        method: 'get'
    })
}

// 新增设备信息
export function addInfo(data) {
    return request({
        url: '/device/info',
        method: 'post',
        data: data
    })
}

// 修改设备信息
export function updateInfo(data) {
    return request({
        url: '/device/info',
        method: 'put',
        data: data
    })
}

// 删除设备信息
export function delInfo(id, tenantId) {
    return request({
        url: '/device/info/' + id + '?tenantId=' + tenantId,
        method: 'delete'
    })
}

// 导出设备信息
export function exportInfo(query) {
    return request({
        url: '/device/info/export',
        method: 'get',
        params: query
    })
}

// 生成设备导入批次
export function generateImportBatchNum() {
    return request({
        url: '/device/info/importBatchNum',
        method: 'get'
    })
}

// 下载导入模板
export function importTemplate() {
    return request({
        url: '/device/info/importTemplate',
        method: 'get'
    })
}

// 查询待升级设备列表
export function listUpgradeDevice(versionId, query) {
    return request({
        url: '/device/info/listUpgradeDevice/' + versionId,
        method: 'get',
        params: query
    })
}
