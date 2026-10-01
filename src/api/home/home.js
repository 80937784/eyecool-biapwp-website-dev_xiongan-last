import request from '@/utils/request'
// 查询场景总数
export function getSceneAll() {
    return request({
      url: '/statistic/scene/countAll',
      method: 'get'
    })
}
// 查询设备总数
export function getDeviceAll() {
    return request({
        url: '/statistic/device/countAll',
        method: 'get'
    })
}
// 查询人员总数
export function getPersonAll() {
    return request({
        url: '/statistic/person/countAll',
        method: 'get'
    })
}
// 查询用户总数
export function getUserAll() {
    return request({
        url: '/statistic/user/countAll',
        method: 'get'
    })
}
// 通行人员
export function getPersonPass() {
    return request({
        url: '/statistic/person/countTodayPass',
        method: 'get'
    })
}
// 设备情况
export function getDecive() {
    return request({
        url: '/statistic/device/countToday',
        method: 'get'
    })
}
// 通行日志
export function getTradelog() {
    return request({
        url: '/statistic/tradelog/countToday',
        method: 'get'
    })
}
// 热门设备
export function getHotDevice() {
    return request({
        url: '/statistic/device/todayLogNumInfo',
        method: 'get'
    })
}
// 通行人员曲线
export function getPeoplePassCurve() {
    return request({
        url: '/statistic/person/todayPassTrend',
        method: 'get'
    })
}
// 在线设备分析--型号
export function getOnlineModelAnalysis() {
    return request({
        url: '/statistic/device/onlineModelAnalysis',
        method: 'get'
    })
}
// 在线设备分析--类型
export function getOnlineTypeAnalysis() {
    return request({
        url: '/statistic/device/onlineTypeAnalysis',
        method: 'get'
    })
}
// 通行日志首屏数据
export function getPassData() {
    return request({
        url: '/statistic/tradelog/realtimeTrade',
        method: 'get'
    })
}
