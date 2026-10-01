import request from '@/utils/request'

// 查询行驶证OCR识别记录列表
export function listLog(query) {
    return request({
        url: '/ocr/drivinglic/list',
        method: 'get',
        params: query
    })
}

// 查询行驶证OCR识别记录详细
export function getLog(id) {
    return request({
        url: '/ocr/drivinglic/' + id,
        method: 'get'
    })
}

// 导出行驶证OCR识别记录
export function exportLog(query) {
    return request({
        url: '/ocr/drivinglic/export',
        method: 'get',
        params: query
    })
}