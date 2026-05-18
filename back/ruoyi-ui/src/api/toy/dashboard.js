import request from '@/utils/request'

export function getStats() {
  return request({
    url: '/api/toy/dashboard/stats',
    method: 'get'
  })
}
