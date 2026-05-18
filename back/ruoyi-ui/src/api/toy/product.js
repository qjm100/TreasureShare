import request from '@/utils/request'

// 查询商品列表
export function listProduct(query) {
  return request({
    url: '/api/toy/products',
    method: 'get',
    params: query
  })
}

// 查询商品详细
export function getProduct(id) {
  return request({
    url: '/api/toy/products/' + id,
    method: 'get'
  })
}

// 新增商品
export function addProduct(data) {
  return request({
    url: '/api/toy/products',
    method: 'post',
    data: data
  })
}

// 修改商品
export function updateProduct(data) {
  return request({
    url: '/api/toy/products/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除商品
export function delProduct(id) {
  return request({
    url: '/api/toy/products/' + id,
    method: 'delete'
  })
}

// 查询分类列表
export function listCategory(query) {
  return request({
    url: '/api/toy/categories',
    method: 'get',
    params: query
  })
}

// 查询分类树
export function getCategoryTree() {
  return request({
    url: '/api/toy/categories/tree',
    method: 'get'
  })
}

// 查询分类详细
export function getCategory(id) {
  return request({
    url: '/api/toy/categories/' + id,
    method: 'get'
  })
}

// 新增分类
export function addCategory(data) {
  return request({
    url: '/api/toy/categories',
    method: 'post',
    data: data
  })
}

// 修改分类
export function updateCategory(data) {
  return request({
    url: '/api/toy/categories/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除分类
export function delCategory(id) {
  return request({
    url: '/api/toy/categories/' + id,
    method: 'delete'
  })
}
