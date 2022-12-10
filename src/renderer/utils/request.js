import axios from 'axios'
import { Message } from 'element-ui'
import store from "../store";
import { ipcRenderer } from "electron";
console.log('前端监听地址', process.env.BASE_API);
const serves = axios.create({
  baseURL: 'http://127.0.0.1:25565',
  timeout: 5000
})

// 设置请求发送之前的拦截器
serves.interceptors.request.use(config => {
  // 设置发送之前数据需要做什么处理
  console.log("??");
  if (store.getters.token) {
    config.headers["authorization"] = store.getters.token; // 让每个请求携带自定义token 请根据实际情况自行修改
  }
  return config
}, err => Promise.reject(err))

// 设置请求接受拦截器
serves.interceptors.response.use(res => {
  // 设置接受数据之后，做什么处理
  if (res.data.statusCode === 400) {
    Message.error(res.data.msg ? res.data.msg : res.data.data)
  }
  return res
}, err => {
  // console.log('error', err.response.data.msg);
  // 判断请求异常信息中是否含有超时timeout字符串
  if (err.message.includes('timeout')) {
    Message.error('网络超时')
  }
  if (err.message.includes('Network Error')) {

    ipcRenderer.invoke("statr-server").then((res) => {
      if (res) {
      } else {
        this.$message({
          type: "error",
          message: "启动失败,请重启"
        });
        Message.error('服务端未启动，或网络连接错误,正在重启进程请稍等')
      }
    });
  }
  if (err.response.data.msg) {

    if (err.response.data.code == 50000) {
      Message.error(err.response.data.msg + ',3秒后关闭软件')
      setTimeout(() => {
        ipcRenderer.invoke("close-app")
      }, 3000)
    } else {
      Message.error(err.response.data.msg ? err.response.data.msg : err.response.data.data)
    }
  }
  // Message.error(err.response.data.msg)
  return Promise.reject(err)
})

// 将serves抛出去
export default serves
