import request from '@/utils/request'

// 查询微信用户列表
export function listOfficalAccountUser(query) {
    return request({
        url: '/msg/officalAccountUser/list',
        method: 'get',
        params: query
    })
}

// 查询微信用户详细
export function getOfficalAccountUser(id) {
    return request({
        url: '/msg/officalAccountUser/' + id,
        method: 'get'
    })
}

// 拉取微信用户
export function pullOfficalAccountUser(data) {
    return request({
        url: '/msg/officalAccountUser/pull',
        method: 'post',
        data: data
    })
}

// 修改微信用户
export function updateOfficalAccountUser(data) {
    return request({
        url: '/msg/officalAccountUser',
        method: 'put',
        data: data
    })
}

// 导出微信用户
export function exportOfficalAccountUser(query) {
    return request({
        url: '/msg/officalAccountUser/export',
        method: 'get',
        params: query
    })
}


// 绑定手机号
export function bindPhone(query) {
    return request({
        url: '/api/mp/bind',
        method: 'post',
        params: query
    })
}

// 获取绑定手机验证码
export function getCaptcha(query) {
    return request({
        url: '/api/mp/captcha',
        method: 'get',
        params: query
    })
}