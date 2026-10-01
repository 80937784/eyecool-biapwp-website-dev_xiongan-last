import request from '@/utils/request'

// 查询身份证正面OCR识别记录列表
export function listLog(query) {
    return request({
        url: '/ocr/idcardfront/list',
        method: 'get',
        params: query
    })
}

// 查询身份证正面OCR识别记录详细
export function getLog(id) {
    return request({
        url: '/ocr/idcardfront/' + id,
        method: 'get'
    })
}

// 导出身份证正面OCR识别记录
export function exportLog(query) {
    return request({
        url: '/ocr/idcardfront/export',
        method: 'get',
        params: query
    })
}