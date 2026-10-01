import request from '@/utils/request'

// 查询营业执照OCR识别记录列表
export function listLog(query) {
    return request({
        url: '/ocr/busilic/list',
        method: 'get',
        params: query
    })
}

// 查询营业执照OCR识别记录详细
export function getLog(id) {
    return request({
        url: '/ocr/busilic/' + id,
        method: 'get'
    })
}

// 导出营业执照OCR识别记录
export function exportLog(query) {
    return request({
        url: '/ocr/busilic/export',
        method: 'get',
        params: query
    })
}