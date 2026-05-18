import request from '@/utils/request'

// 查询订单列表
export function listOrder(query) {
  return request({
    url: '/api/toy/orders',
    method: 'get',
    params: query
  })
}

// 查询订单详细
export function getOrder(id) {
  return request({
    url: '/api/toy/orders/' + id,
    method: 'get'
  })
}

// 订单发货
export function shipOrder(id, logisticsNo) {
  return request({
    url: '/api/toy/orders/' + id + '/ship',
    method: 'put',
    data: { logisticsNo }
  })
}

// 确认归还
export function confirmReturn(id) {
  return request({
    url: '/api/toy/orders/' + id + '/confirm-return',
    method: 'put'
  })
}

// 消毒完成
export function disinfectComplete(id) {
  return request({
    url: '/api/toy/orders/' + id + '/disinfect',
    method: 'put'
  })
}
