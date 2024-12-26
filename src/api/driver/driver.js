import request from '@/utils/request'

// 查询司机基本信息列表
export function listDriver(query) {
  return request({
    url: '/driver/driver/list',
    method: 'get',
    params: query
  })
}

// 查询司机基本信息详细
export function getDriver(uid) {
  return request({
    url: '/driver/driver/' + uid,
    method: 'get'
  })
}

// 新增司机基本信息
export function addDriver(data) {
  return request({
    url: '/driver/driver',
    method: 'post',
    data: data
  })
}

// 修改司机基本信息
export function updateDriver(data) {
  return request({
    url: '/driver/driver',
    method: 'put',
    data: data
  })
}

// 删除司机基本信息
export function delDriver(uid) {
  return request({
    url: '/driver/driver/' + uid,
    method: 'delete'
  })
}

// 结束任务接口
export function lineEndTask(data) {
  return request({
    url: '/line/end/task',
    method: 'post',
    data
  })
}
