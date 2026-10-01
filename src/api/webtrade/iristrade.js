import request from '@/utils/request'

// 虹膜1v1比对
export function irisMatchOne(data) {
  return request({
    url: '/webtrade/iris/matchone',
    method: 'post',
    data: data
  })
}

// 虹膜1vN比对
export function irisMatchN(data) {
  return request({
    url: '/webtrade/iris/matchn',
    method: 'post',
    data: data
  })
}


// 虹膜图片比较
export function irisComparetwo(data) {
  return request({
    url: '/webtrade/iris/comparetwo',
    method: 'post',
    data: data
  })
}
