import request from '@/utils/request'

// 查询护照OCR识别记录列表
export function listLog(query) {
    return request({
        url: '/ocr/passport/list',
        method: 'get',
        params: query
    })
}

// 查询护照OCR识别记录详细
export function getLog(id) {
    return request({
        url: '/ocr/passport/' + id,
        method: 'get'
    })
}

// 导出护照OCR识别记录
export function exportLog(query) {
    return request({
        url: '/ocr/passport/export',
        method: 'get',
        params: query
    })
}