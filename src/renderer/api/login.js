// 仅示例
import request from '@/utils/request'

// export function login (data) {
//   return request({
//     url: '/user/login',
//     method: 'post',
//     data
//   })
// }

// export function getInfo (token) {
//   return request({
//     url: '/user/info',
//     method: 'get',
//     params: { token }
//   })
// }
export function message() {
  return request({
    url: '/message',
    method: 'get'
  })
}

export function login(username, password) {
  return request({
    url: '/auth/login',
    method: 'post',
    data: {
      username,
      password
    }
  })
}
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}
export function getInfo() {
  return request({
    url: '/admin/info',
    method: 'get',
  })
}



export function isstart() {
  return request({
    url: '/isstart',
    method: 'get',
  })
}