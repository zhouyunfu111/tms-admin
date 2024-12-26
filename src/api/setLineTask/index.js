import request from '@/utils/request'

// 获取路由
export const getLineList = (params) => {
  return request({
    url: '/line/list',
    method: 'get',
    params
  })
}

// 司机管理
export const getDriverList = (params) => {
  return request({
    url: '/driver/driver/list',
    method: 'get',
    params
  })
}

// 任务指派
export const assingLineTaskDes = (data) => {
  return request({
    url: '/line/task/des',
    method: 'put',
    data
  })
}

// 获取订单列表
export const getShopOrderList = (params) => {
  return request({
    url: '/mall/shop/order/list',
    method: 'get',
    params
  })
}
//新增排线任务
export const addLineTask = (data) => {
  return request({
    url: '/line/add',
    method: 'post',
    data
  })
}

//删除排线任务
export const deleteLine = (data) => {
  return request({
    url: `/line/delete`,
    method: 'delete',
    data
  })
}


//获取排线任务详情
export const getLineDetail = (params) => {
  return request({
    url: `/line/detail`,
    method: 'get',
    params
  })
}

//修改排线任务
export const updateLine = (data) => {
  return request({
    url: `/line/update`,
    method: 'put',
    data
  })
}

//修改排线任务
export const lineTrace = (params) => {
  return request({
    url: `/line/trace`,
    method: 'get',
    params
  })
}

//结束排线任务
export const lineEndTask = (data) => {
  return request({
    url: `/line/end/task`,
    method: 'post',
    data
  })
}
//转派任务
export const transferLineTask = (data) => {
  return request({
    url: `/line/task/transfer`,
    method: 'put',
    data
  })
}
