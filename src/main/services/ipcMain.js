import { ipcMain, dialog, BrowserWindow, app } from 'electron'

import { version, name } from '../../../package.json'
import Server from '../server/index'
import { winURL } from '../config/StaticPath'
import downloadFile from './downloadFile'
import Update from './checkupdate'
import { updater } from './HotUpdater'
import { v4 as uuidv4 } from 'uuid';
import { spawn, fork } from 'child_process'
import { getMainWindow } from './windowManager'
import path, { join } from 'path'
import * as fs from 'fs'
import { accessSync } from 'fs-extra'
const apihost = 'http://bt.leading.ren:3000'
const md5 = require('md5')
const request = require('request-promise-native')
var userListPath = path.join('C:/', 'userList')//用户登录凭证文件夹
if (!fs.existsSync(userListPath)) {
  fs.mkdirSync(userListPath)
}
import zhHandler from './zhHandler'
//const WorkerPool = require('./worker_pool.js');//线程池
const os = require('os');
//const pool = new WorkerPool(os.cpus().length);
var crypto = require('crypto');
//运行起一个进程
const c = require('./code')//解密
export default {
  Mainfunc(IsUseSysTitle) {
    const allUpdater = new Update();
    //登录
    ipcMain.handle('login', async (event, arg) => {
      console.log('登录页面登录', arg);
      //查询服务器接口进行登录
      arg.password = md5(arg.password)
      let result = false
      try {
        let r = await request.post(apihost + '/auth/login', { body: arg, json: true })
        console.log('正确返回,登录成功', r);
        let tokenobj = { token: r.data.tokenHead + r.data.token }
        //写出token
        fs.writeFileSync(path.join(userListPath, 'token.json'), JSON.stringify(tokenobj))
        result = tokenobj
      } catch (error) {
        //console.log(JSON.stringify(error));
        let e = JSON.parse(JSON.stringify(error)).error
        console.log(e);
        return e
      }



      return result
    })
    ipcMain.handle('createLink', async (event, arg) => {
      return await zhHandler.createLink(arg)
    })

    ipcMain.handle('userPath', async (event, arg) => {
      console.log('获取用户路径', arg);
      //if (!this.websocket) this.connet();
      if (arg.action == 'get') {

        return { path: userListPath }
      } else if (arg.action == 'set') {
        userListPath = arg.path
        //判断路径是否存在
        if (!fs.existsSync(userListPath)) {
          fs.mkdirSync(userListPath)
        }
        return 'ok'
      }
    })

    ipcMain.handle('config', async (event, arg) => {
      console.log('配置', arg);
      let _defaultConfig = {
        groupKeyword: "",
      }
      //判断配置表是否存在
      if (!fs.existsSync(path.join(userListPath, 'config.json'))) {
        //不存在则创建
        fs.writeFileSync(path.join(userListPath, 'config.json'), JSON.stringify(_defaultConfig))
      }
      //读取配置表
      let config = JSON.parse(fs.readFileSync(path.join(userListPath, 'config.json')).toString())
      this.groupKeyword = config.groupKeyword
      //判断是否有传入参数
      if (typeof arg == 'object') {
        if (arg.action == 'get') {
          /*
          let carr = Object.keys(this.clientList)
          if (carr.length > 0) {
            //挂着现有链接中的数据给前台
            this.clientList[index]['userinfo']['info']  //用户信息
            this.clientList[index]['userinfo']['NowSession'] 
            this.clientList[index]['userinfo']['Group'] 
            this.clientList[index]['userinfo']['friends']
          }*/
          return { config }
        } else if (arg.action == 'set') {
          //写入配置表
          fs.writeFileSync(path.join(userListPath, 'config.json'), JSON.stringify(arg.data))
          //更新配置
          this.groupKeyword = arg.data.groupKeyword
          return true
        } else if (arg.action == 'savesecret') {
          //向服务器询问是否有该key
          try {
            var key = "12345678";
            var iv = "abcdefgh";
            let did = await c.default.getdieviceid();
            let data = {
              key: arg.key,
              did: did
            }
            let d = encrypt(JSON.stringify(data), key, iv)
            let result = await request.post(apihost + '/device/wincheck', { body: { data: d }, json: true })
            //校验响应签名
            if (result.statusCode == 200 && result.data) {

              //解密
              let r = decrypt(result.data, key, iv)
              console.log(r);
              r = JSON.parse(r)
              if (r.code == 1 && r.key == arg.key) {
                //读取本来配置
                let config = JSON.parse(fs.readFileSync(path.join(userListPath, 'config.json')).toString())
                this.secret = arg.key;
                config.secret = arg.key
                //保存
                fs.writeFileSync(path.join(userListPath, 'config.json'), JSON.stringify(config))
                return true
              }
            }
            return false
          } catch (error) {
            console.log(error);
            return false
          }

        } else if (arg.action == 'getsecret') {
          //读取配置
          let config = JSON.parse(fs.readFileSync(path.join(userListPath, 'config.json')).toString())
          if (config.secret) {
            var key = "12345678";
            var iv = "abcdefgh";
            let did = await c.default.getdieviceid();
            let data = {
              key: config.secret,
              did: did
            }
            let d = encrypt(JSON.stringify(data), key, iv)
            let result = await request.post(apihost + '/device/wincheck', { body: { data: d }, json: true })
            //校验响应签名
            if (result.statusCode == 200 && result.data) {
              //解密
              let r = decrypt(result.data, key, iv)
              console.log('解密', r);
              r = JSON.parse(r)
              if (r.code == 1 && r.key == config.secret) {
                //读取本来配置
                this.secret = config.secret
                return { secret: config.secret }
              }
            }
          }
          return { secret: '' }
        } else if (arg.action == 'getscriptpath') {
          let config = JSON.parse(fs.readFileSync(path.join(userListPath, 'config.json')).toString())
          if (config.scriptpath) {
            return { scriptpath: config.scriptpath }
          }
          return { scriptPath: '' }
        } else if (arg.action == 'savescriptpath') {
          //读取本来配置
          let config = JSON.parse(fs.readFileSync(path.join(userListPath, 'config.json')).toString())

          config.scriptpath = arg.scriptpath
          //保存
          fs.writeFileSync(path.join(userListPath, 'config.json'), JSON.stringify(config))
          return true
        }
      }

    })

    ipcMain.handle('IsUseSysTitle', async () => {
      return IsUseSysTitle
    })
    ipcMain.handle('windows-mini', (event, args) => {
      BrowserWindow.fromWebContents(event.sender)?.minimize()
    })
    ipcMain.handle('window-max', async (event, args) => {
      if (BrowserWindow.fromWebContents(event.sender)?.isMaximized()) {
        BrowserWindow.fromWebContents(event.sender)?.unmaximize()
        return { status: false }
      } else {
        BrowserWindow.fromWebContents(event.sender)?.maximize()
        return { status: true }
      }
    })
    ipcMain.handle('window-close', (event, args) => {
      BrowserWindow.fromWebContents(event.sender)?.close()
    })
    ipcMain.handle('start-download', (event, msg) => {
      downloadFile.download(BrowserWindow.fromWebContents(event.sender), msg.downloadUrL)
    })
    ipcMain.handle('check-update', (event, args) => {
      allUpdater.checkUpdate(BrowserWindow.fromWebContents(event.sender))
    })
    ipcMain.handle('confirm-update', () => {
      allUpdater.quitInstall()
    })
    ipcMain.handle('hot-update', (event, arg) => {
      updater(BrowserWindow.fromWebContents(event.sender))
    })
    //获取应用版本和路径
    ipcMain.handle('get-app-info', (event, args) => {
      return { version: version, path: app.getAppPath() }
    })
    ipcMain.handle('open-messagebox', async (event, arg) => {
      const res = await dialog.showMessageBox(BrowserWindow.fromWebContents(event.sender), {
        type: arg.type || 'info',
        title: arg.title || '',
        buttons: arg.buttons || [],
        message: arg.message || '',
        noLink: arg.noLink || true
      })
      return res
    })
    ipcMain.handle('open-errorbox', (event, arg) => {
      dialog.showErrorBox(
        arg.title,
        arg.message
      )
    })
    ipcMain.handle('statr-server', async () => {
      try {
        const serveStatus = fales// await Server.StatrServer() //不开启服务
        return serveStatus
      } catch (error) {
        dialog.showErrorBox(
          '错误',
          error
        )
      }
    })
    ipcMain.handle('stop-server', async (event, arg) => {
      try {
        const serveStatus = await Server.StopServer()
        return serveStatus
      } catch (error) {
        dialog.showErrorBox(
          '错误',
          error
        )
      }
    })
    ipcMain.handle('close-app', async (event, arg) => {
      console.log('close-app');
      app.quit()
    })
    let childWin = null;
    let cidArray = [];
    ipcMain.handle('open-win', (event, arg) => {
      let cidJson = { id: null, url: '' }
      let data = cidArray.filter((currentValue) => {
        if (currentValue.url === arg.url) {
          return currentValue
        }
      })
      if (data.length > 0) {
        //获取当前窗口
        let currentWindow = BrowserWindow.fromId(data[0].id)
        //聚焦窗口
        currentWindow.focus();
      } else {
        //获取主窗口ID
        let parentID = event.sender.id
        //创建窗口
        childWin = new BrowserWindow({
          width: arg?.width || 842,
          height: arg?.height || 595,
          //width 和 height 将设置为 web 页面的尺寸(译注: 不包含边框), 这意味着窗口的实际尺寸将包括窗口边框的大小，稍微会大一点。 
          useContentSize: true,
          //自动隐藏菜单栏，除非按了Alt键。
          autoHideMenuBar: true,
          //窗口大小是否可调整
          resizable: arg?.resizable ?? false,
          //窗口的最小高度
          minWidth: arg?.minWidth || 842,
          show: arg?.show ?? false,
          //窗口透明度
          opacity: arg?.opacity || 1.0,
          //当前窗口的父窗口ID
          parent: parentID,
          frame: IsUseSysTitle,
          webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            //使用webview标签 必须开启
            webviewTag: arg?.webview ?? false,
            // 如果是开发模式可以使用devTools
            devTools: process.env.NODE_ENV === 'development',
            // 在macos中启用橡皮动画
            scrollBounce: process.platform === 'darwin',
            // 临时修复打开新窗口报错
            contextIsolation: false
          }
        })
        childWin.loadURL(winURL + `#${arg.url}`)
        cidJson.id = childWin?.id
        cidJson.url = arg.url
        cidArray.push(cidJson)
        childWin.webContents.once('dom-ready', () => {
          childWin.show()
          childWin.webContents.send('send-data', arg.sendData)
          if (arg.IsPay) {
            // 检查支付时候自动关闭小窗口
            const testUrl = setInterval(() => {
              const Url = childWin.webContents.getURL()
              if (Url.includes(arg.PayUrl)) {
                childWin.close()
              }
            }, 1200)
            childWin.on('close', () => {
              clearInterval(testUrl)
            })
          }
        })
        childWin.on('closed', () => {
          childWin = null
          let index = cidArray.indexOf(cidJson)
          if (index > -1) {
            cidArray.splice(index, 1);
          }
        })
      }
      childWin.on('maximize', () => {
        if (cidJson.id != null) {
          BrowserWindow.fromId(cidJson.id).webContents.send("w-max", true)
        }
      })
      childWin.on('unmaximize', () => {
        if (cidJson.id != null) {
          BrowserWindow.fromId(cidJson.id).webContents.send("w-max", false)
        }
      })
    })
  },

  //服务器长连接
  connet() {
    const socket = io(apihost)
    let that = this
    socket.on('msg', (data, cb) => {
      console.log('信息', data);

    });
    socket.on("connect", async (e) => {
      console.log("链接成功");
      that.websocket = socket;
      //获取配置
    });

    socket.on("error", async (err) => {
      console.log("出现错误", err);
    });
    //如果服务器断开 需要客户端服务器强行重连
    //除了自身调用disconnect() 或者服务器主动断开连接,其他情况都说尝试自动重连
    socket.on("disconnect", (reason) => {
      console.log('服务器断开连接,尝试重连', reason);
      if (reason === "io server disconnect") {
        // the disconnection was initiated by the server, you need to reconnect manually
        socket.connect();
      }
      // else the socket will automatically try to reconnect
    });
  },
}
function encrypt(plainText, encryptkey, encryptiv) {
  var cipher = crypto.createCipheriv('des-cbc', encryptkey, encryptiv);
  cipher.setAutoPadding(true);
  var encryptedText = cipher.update(plainText, 'utf8', 'base64');
  encryptedText += cipher.final('base64');
  return encryptedText;
}
function decrypt(encryptedText, encryptkey, encryptiv) {
  var decipher = crypto.createDecipheriv('des-cbc', encryptkey, encryptiv);
  decipher.setAutoPadding(true);
  var plainText = decipher.update(encryptedText, 'base64', 'utf8');
  plainText += decipher.final('utf8');
  return plainText;
}
