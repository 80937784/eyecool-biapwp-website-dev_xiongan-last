import request from '@/utils/request'

// 查询人员证件信息列表
export function asynctaskResult(taskId) {
    return request({
        url: `/common/asynctask/result/${taskId}`,
        method: 'get'
    })
}