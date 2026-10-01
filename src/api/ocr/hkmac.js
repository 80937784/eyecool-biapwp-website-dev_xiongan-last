import request from '@/utils/request'

// 查询港澳通行证OCR识别记录列表
export function listLog(query) {
    return request({
        url: '/ocr/hkmac/list',
        method: 'get',
        params: query
    })
}

// 查询港澳通行证OCR识别记录详细
export function getLog(id) {
    return request({
        url: '/ocr/hkmac/' + id,
        method: 'get'
    })
}

// 导出港澳通行证OCR识别记录
export function exportLog(query) {
    return request({
        url: '/ocr/hkmac/export',
        method: 'get',
        params: query
    })
}