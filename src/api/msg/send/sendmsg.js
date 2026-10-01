import request from '@/utils/request'

// 发送短信
export function sendSms(data) {
  return request({
    url: '/msg/send/sms',
    method: 'post',
    data: data
  })
}

// 发送邮件
export function sendMail(query) {
  return request({
    url: '/msg/send/mail',
    method: 'post',
    params: query
  })
}

// 发送微信
export function sendWeixin(data) {
  return request({
    url: '/msg/send/weixin',
    method: 'post',
    data: data
  })
}

// 发送钉钉
export function sendDingtalk(data) {
  return request({
    url: '/msg/send/dingtalk',
    method: 'post',
    data: data
  })
}
