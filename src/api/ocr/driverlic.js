import request from '@/utils/request'

// 查询驾驶证OCR识别记录列表
export function listLog(query) {
    return request({
        url: '/ocr/driverlic/list',
        method: 'get',
        params: query
    })
}

// 查询驾驶证OCR识别记录详细
export function getLog(id) {
    return request({
        url: '/ocr/driverlic/' + id,
        method: 'get'
    })
}

// 导出驾驶证OCR识别记录
export function exportLog(query) {
    return request({
        url: '/ocr/driverlic/export',
        method: 'get',
        params: query
    })
}