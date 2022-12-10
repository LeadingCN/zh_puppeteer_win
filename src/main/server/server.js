import express from 'express'
import cloud from './cloud'
import botim from './botim'
const app = express()
app.use(express.json());
const whiteList = ['/auth/login', '/auth/logout', '/isstart']


//路由
//botim协议实现
app.use('/botim/init', botim.init)
//登录相关
app.post('/auth/login', cloud.login)
app.get('/message', (req, res) => {
  res.send('这是来自node服务端的信息')
})
app.post('/message', (req, res) => {
  if (req) {
    res.send(req + '--来自node')
  }
})
//统一返回出错错误
app.use((err, req, res, next) => {
  err = err.toString();
  let message = err.substring(7, err.length);
  let tempcode = message == '非法登录,请重新登录' ? 50000 : 500;
  // console.log(tempcode, message);
  res.status(500).send({ code: tempcode, msg: message ? message : '服务器错误' })
})
export default app
