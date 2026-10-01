import request from '@/utils/request'

// 人脸1v1比对
export function faceMatchOne(data) {
    return request({
        url: '/webtrade/face/matchone',
        method: 'post',
        data: data,
    })
}

// 人脸1vN比对
export function faceMatchN(data) {
    return request({
        url: '/webtrade/face/matchn',
        method: 'post',
        data: data,
    })
}


// 人脸图片比较
export function faceComparetwo(data) {
    return request({
        url: '/webtrade/face/comparetwo',
        method: 'post',
        data: data
    })
}