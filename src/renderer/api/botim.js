import request from '@/utils/request'
export function init(data) {
  return request({
    url: '/botim/init',
    method: 'post',
    data
  })
}

export function getInfo(params) {
  return request({
    url: '/botim/init',
    method: 'get',
    params
  })
}