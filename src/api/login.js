import request from '@/utils/request'

// 登录方法
export function login(username, password, code, uuid) {
  const data = {
    username,
    password,
    code,
    uuid
  }
  return request({
    url: '/login',
    method: 'post',
    data: data
  })
}
// 登录方法
export function bioLogin(bioUsername, bioLoginType, bioData) {
  const data = {
    "bioUsername":bioUsername,
    "bioData":bioData,
    "bioLoginType":bioLoginType,
  }
  return request({
    url: '/bioLogin',
    method: 'post',
    data: data
  })
}
// 获取用户详细信息
export function getInfo() {
  return request({
    url: '/getInfo',
    method: 'get'
  })
}

// 退出方法
export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: '/captchaImage',
    method: 'get'
  })
}
// 判断密码是否有效
export function getValid(data) {
  return request({
    url: '/system/userSecurity/validUserName',
    method: 'post',
    params:data
  })
}
// 升级密码
export function upgradePwd(data) {
  return request({
    url: '/system/userSecurity/upgradePwd',
    method: 'post',
    params:data
  })
}
// 获取验证码
export function getCode(data) {
  return request({
    url: '/system/userSecurity/getbackPwd/catpcha',
    method: 'post',
    params:data
  })
}
// 密码重置
export function pwdReset(data) {
  return request({
    url: '/system/userSecurity/getbackPwd/reset',
    method: 'post',
    params:data
  })
}