import request from "@/utils/request";

// 查询银行卡OCR识别记录列表
export function listLog(query) {
    return request({
        url: "/ocr/bankcard/list",
        method: "get",
        params: query
    });
}

// 查询银行卡OCR识别记录详细
export function getLog(id) {
    return request({
        url: "/ocr/bankcard/" + id,
        method: "get"
    });
}
// 导出银行卡OCR识别记录
export function exportLog(query) {
    return request({
        url: "/ocr/bankcard/export",
        method: "get",
        params: query
    });
}
