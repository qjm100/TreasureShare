import request from '@/utils/request'

// 查询评价列表（productId=0 表示查询所有评价）
export function listEvaluation(query) {
  return request({
    url: '/api/toy/evaluations/0',
    method: 'get',
    params: query
  })
}

// 删除评价
export function delEvaluation(id) {
  return request({
    url: '/api/toy/evaluations/' + id,
    method: 'delete'
  })
}
