import request from '@/utils/request'
// 通行人员统计
export function getTrend(query) {
    return request({
        url: '/statistic/person/passTrend',
        method: 'get',
        params:query
    })
}
// 设备情况分析
export function getDevice(query) {
    return request({
        url: '/statistic/device/numTrend',
        method: 'get',
        params:query
    })
}
// 设备日志统计
export function getTradelog(query) {
    return request({
        url: '/statistic/tradelog/trend',
        method: 'get',
        params:query
    })
}