import request from '@/utils/request'

// 查询生成表数据
export function genQrCode(data) {
    return request({
        url: '/tool/qrcode/gen',
        method: 'post',
        data: data
    })
}