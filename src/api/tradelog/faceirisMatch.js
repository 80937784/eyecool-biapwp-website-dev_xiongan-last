import request from '@/utils/request'

// 查询人脸虹膜多模态比对日志列表
export function listFaceirisMatch(query) {
    return request({
        url: '/tradelog/faceirisMatch/list',
        method: 'get',
        params: query
    })
}

// 查询人脸虹膜多模态比对日志详细
export function getFaceirisMatch(id) {
    return request({
        url: '/tradelog/faceirisMatch/' + id,
        method: 'get'
    })
}
// 导出人脸虹膜多模态比对日志
export function exportFaceirisMatch(query) {
    return request({
        url: '/tradelog/faceirisMatch/export',
        method: 'get',
        params: query
    })
}