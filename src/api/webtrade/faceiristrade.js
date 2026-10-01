import request from '@/utils/request'

// 人脸虹膜多模态1v1比对
export function faceIrisMatchOne(data) {
    return request({
        url: '/webtrade/faceiris/matchone',
        method: 'post',
        data: data
    })
}