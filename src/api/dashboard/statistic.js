import request from '@/utils/request'

export function queryBasePersonCountInfo() {
    return request({
        url: '/statistic/basePersonCountInfo',
        method: 'POST',
    })
}
export function queryChannelCountInfo() {
    return request({
        url: '/statistic/channelCountInfo',
        method: 'POST',
    })
}

export function queryDeviceCountInfo() {
    return request({
        url: '/statistic/deviceCountInfo',
        method: 'POST',
    })
}

export function queryServiceCountInfo() {
    return request({
        url: '/statistic/serviceCountInfo',
        method: 'POST',
    })
}