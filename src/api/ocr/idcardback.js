import request from '@/utils/request'

// 查询身份证背面OCR识别记录列表
export function listLog(query) {
    console.log(1);
    return request({
        url: '/ocr/idcardback/list',
        method: 'get',
        params: query
    })
}

// 查询身份证背面OCR识别记录详细
export function getLog(id) {
    return request({
        url: '/ocr/idcardback/' + id,
        method: 'get'
    })
}

// 导出身份证背面OCR识别记录
export function exportLog(query) {
    return request({
        url: '/ocr/idcardback/export',
        method: 'get',
        params: query
    })
}