import request from '@/utils/request'

// 指纹1v1比对
export function fingerMatchOne(data) {
  return request({
    url: '/webtrade/finger/matchone',
    method: 'post',
    data: data
  })
}

// 指纹1vN比对
export function fingerMatchN(data) {
  return request({
    url: '/webtrade/finger/matchn',
    method: 'post',
    data: data
  })
}


// 指纹图片比较
export function fingerComparetwo(data) {
  return request({
    url: '/webtrade/finger/comparetwo',
    method: 'post',
    data: data
  })
}
