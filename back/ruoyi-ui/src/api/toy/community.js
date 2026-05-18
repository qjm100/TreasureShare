import request from '@/utils/request'

// 查询社区帖子列表
export function listPost(query) {
  return request({
    url: '/api/toy/community/posts',
    method: 'get',
    params: query
  })
}

// 删除帖子
export function delPost(id) {
  return request({
    url: '/api/toy/community/posts/' + id,
    method: 'delete'
  })
}
