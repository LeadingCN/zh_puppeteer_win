import { el } from 'date-fns/locale'
import { ipcMain, dialog, BrowserWindow, app } from 'electron'
import { getMainWindow } from '../services/windowManager'
const request = require('request-promise-native')
const fs = require('fs')
const path = require('path')
const { spawn } = require("child_process");
const apihost = 'http://z.yyeth.top' // 'http://127.0.0.1:3000' //
export default {//export default
  token: "",
  scriptPath: "",
  nowIp: "",
  ADSL: null,
  iplist: null,
  async createLink(arg) {
    let win = getMainWindow();
    if (this.nowIp == '') {
      let tip = await this.getIp();
      console.log("当前ip", tip);
      if (tip) {
        this.nowIp = tip;
      }
    }
    console.log("处理createLink", arg);
    let { amount, linkcount, model, data } = arg;
    let ci = data ? data.length : linkcount
    console.log("ci值", ci);
    for (let i = 0; i < ci; i++) {
      if (i >= ci) break
      //执行拨号网络 断线重连
      let br = await this.bohao()
      if (br && br == 'ok') {
        //请求服务器获取cmd 账号 参数

        let a = null;
        if (model == 'cloud') {
          a = await this.getArg()
        } else {
          a = arg.data[i]
        }

        //执行shell 运行nodejs脚本
        if (!a) {
          win.webContents.send('msg', { event: "zherr" })
          return
        }
        let msg = await this.runZhScript(a, amount);
        if (msg) {
          //执行成功,更新数据库
          //请求服务器更新数据库
          if (this.token == '') {
            //读取token.json
            let t = fs.readFileSync(path.join('C:/userList', 'token.json'))
            this.token = JSON.parse(t).token
          }
          console.log(`zh=${msg.zh}&pay_link=${msg.pay_link}&quota=${Number(msg.quota) * 100}&oid=${msg.oid}&zid=${msg.zid}`);
          //'${msg.zh}',${Number(msg.quota) * 100},'${msg.pay_link}',0,now(),1,'${msg.oid}','${msg.zid}'
          fs.appendFileSync(path.join('C:/userList', 'link.txt'), `${msg.zh}----${msg.quota}----${msg.oid}----${msg.pay_link}\r\n`)
          const buff = Buffer.from(msg.pay_link, 'utf-8');

          // encode buffer as Base64
          const base64 = buff.toString('base64');
          try {
            let u = await request.get({ url: apihost + '/api/getonecreate' + `?token=${this.token}&action=savelink&zh=${msg.zh}&pay_link=${base64}&quota=${Number(msg.quota) * 100}&oid=${msg.oid}&zid=${msg.zid}` })
            u = JSON.parse(u)
            if (u.data == 'ok') {
              console.log('更新数据库成功')
              win.webContents.send('msg', { event: "succss", data: msg })
            }
          } catch (error) {
            fs.appendFileSync(path.join('C:/userList', 'uperrlink.txt'), `${msg.zh}----${msg.quota}----${msg.oid}----${msg.pay_link}\r\n`)
            win.webContents.send('msg', { event: "savelinkerr" })
          }

        } else {
          win.webContents.send('msg', { event: "outtime" })
        }
      } else if (br && br == 'reset') {
        win.webContents.send('msg', { event: "ipisuse" })

      }
      else {
        console.log('拨号超时')
        win.webContents.send('msg', { event: "拨号超时" })
        // dialog.showErrorBox(
        //   "错误",
        //   "拨号失败"
        // )
      }
    }
    //return 'ok'
  },

  async sleep(delay) {
    return new Promise((resolve) => {
      setTimeout(resolve, delay);
    });
  },
  async bohao() {
    //先断开
    console.log("断开");
    await this.destroyConnect();
    console.log("等待");
    await this.sleep(5000);
    //重现链接
    console.log("连接");
    await this.createConnect();
    //判断ip是否跟现在一样
    console.log("更新");
    let i = 0
    do {
      let tIp = await this.getIp();
      if (tIp && tIp != this.nowIp) {
        win.webContents.send('msg', { event: "重连成功", ip: tIp })
        //判断ip是否在ip列表 TODO
        if (!this.iplist) {
          //从配置文件夹中读取
          let iplist = fs.readFileSync(path.join('C:/userList', 'iplist.txt')).toString()
          if (iplist != '') {
            this.iplist = iplist.split('\r\n')
          } else {
            this.iplist = []
          }
        }
        if (this.iplist.indexOf(tIp) == -1) {
          //正常 就是 nowIp 更新
          this.nowIp = tIp
          this.iplist.push(tIp)
          //追加文件
          fs.appendFileSync(path.join('C:/userList', 'iplist.txt'), tIp + '\r\n')
          console.log("新ip", tIp);
          return 'ok'
        } else {
          console.log("ip重复", tIp);
          return 'reset'
        }

      }
      await this.sleep(1000);
      i++;
      if (i > 30) {
        return false
      }
    } while (true)


    //返回真 

  },
  async destroyConnect() {
    //Rasdial 宽带连接 051042653412 1p0qne3q
    let childp = spawn("Rasdial",
      ['宽带连接', '/disconnect'],
      { stdio: [null, null, null, "ipc"] }

    );
    // //进程标准输出流事件 监听
    childp.stdout.on("data", async (data) => {
      data = data.toString()
      console.log(data);
      if (data.indexOf('命令已完成') > -1) {
        console.log("断开链接成功");
      }
    });


  },
  async createConnect() {
    //Rasdial 宽带连接 051042653412 1p0qne3q
    //读取 config.json 配置文件
    if (!this.ADSL) {
      let config = JSON.parse(fs.readFileSync(path.join('C:/userList', 'config.json')).toString())
      this.ADSL = config.ADSL
    }


    let childp = spawn("Rasdial",
      ['宽带连接', this.ADSL.user, this.ADSL.pwd],
      { stdio: [null, null, null, "ipc"] }
    );
    // //进程标准输出流事件 监听
    childp.stdout.on("data", async (data) => {
      data = data.toString()
      console.log(data);

    });

  },
  async getIp() {
    return new Promise((resolve, reject) => {
      let childp = spawn("curl",
        ['cip.cc'],
        { stdio: [null, null, null, "ipc"] }

      );
      // //进程标准输出流事件 监听
      childp.stdout.on("data", async (data) => {
        data = data.toString()
        if (data.indexOf('IP') > -1) {
          //解析
          let t = data.split('地址')[0]
          t = t.split(':')[1]
          if (t.indexOf('.') > -1) {
            resolve(t);
          }
        }
      });
      /**
       * 开始拨号命令：Rasdial 宽带连接 abc（账号） 123（密码）
  
  断开拨号命令：Rasdial 宽带连接 /disconnect
  
  断开网络连接：rasphone -h 宽带连接
       * 
       */
    })
  },

  async getArg() {
    if (this.token == '') {
      //读取token.json
      let t = fs.readFileSync(path.join('C:/userList', 'token.json'))
      this.token = JSON.parse(t).token
    }
    //select * FROM zh WHERE is_delete = 0 AND enable = 1 AND quota >=5000 AND quota-quota_temp >= 5000 AND balance_lock = 0 AND zh not in (SELECT zh FROM paylink WHERE channel = 1 AND unix_timestamp(NOW())-unix_timestamp(create_time) < 86400) ORDER BY RAND() LIMIT 1
    let result = await request.get({ url: apihost + '/api/getonecreate' + `?token=${this.token}&action=getzh` })
    result = JSON.parse(result)
    if (result.code && result.code == 1 && result.data) {
      console.log('获取参数成功', result.data);
      return result.data
    }
    return false
  },
  async runZhScript(zh, quota) {
    if (this.scriptPath == '') {
      //读取token.json
      let t = fs.readFileSync(path.join('C:/userList', 'config.json'))
      this.scriptPath = JSON.parse(t).scriptpath
    }
    let args = [this.scriptPath,
    zh.zh,
    zh.cookie,
      `top`,
      quota,
      1,
    zh.zid,
    -1,
    ]
    //使用Promise
    return new Promise((resolve, reject) => {
      let subchild = spawn(
        "node",
        args,
        { stdio: [null, null, null, "ipc"] }
      );
      if (subchild) {
        //子进程向父进程发送信息
        subchild.on("message", async (msg) => {
          console.log('监听子进程信息', msg);
          switch (msg.action) {

            case 'top':
              console.log('top_EX =>' + JSON.stringify(msg));
              //await this.sql.query(`UPDATE task SET status = 1 WHERE id = ${msg.insertId}`);
              if (msg.result == '成功') {
                console.log('top_EX =>' + `${msg.zh} create top_link success `)
                resolve(msg)
                //插入链接信息
                //let pay_link_lock_time = await this.utils.getsetcache('pay_link_lock_time', 120);
                //await this.sql.query(`INSERT INTO paylink(zh,quota,pay_link,result,up_time,create_status,oid,zid,lock_time) VALUES ('${msg.zh}',${Number(msg.quota) * 100},'${msg.pay_link}',0,now(),1,'${msg.oid}','${msg.zid}',FROM_UNIXTIME(unix_timestamp(now()) - ${pay_link_lock_time}))`)

              } else if (msg.result == '超时') {
                resolve(false)
                //,quota_temp = quota_temp - ${Number(msg.quota) * 100},quota_total = quota_total - ${Number(msg.quota) * 100}
                console.log(`'top_EX =>' + ${msg.zh} create ${msg.quota} top_link  outtime `)
                //await this.sql.query(`INSERT INTO paylink(zh,quota,pay_link,result,up_time,create_status,zid) VALUES ('${msg.zh}',${msg.quota},'${msg.result}',1,now(),-1,'${msg.zid}')`)
              } else if (msg.result == '风险验证') {
                resolve(false)
                console.log(`'top_EX =>' + ${msg.zh} create ${msg.quota} top_link  verifycode `)
                //await this.sql.query(`INSERT INTO paylink(zh,quota,pay_link,result,up_time,create_status,zid) VALUES ('${msg.zh}',${msg.quota},'${msg.result}',1,now(),-1,'${msg.zid}')`)
              }

              break;
          }
        });
        // //进程标准输出流事件 监听
        subchild.stdout.on("data", async (data) => {
          //let islog = await this.utils.getsetcache('scriptlog', 60)
          console.log('top_EX =>' + data.toString());
        });
        //出错监听
        subchild.stderr.on("data", (data) => {
          data = data.toString();
          console.log("error" + data);
        });
        //退出 监听
        subchild.on("exit", (code, signal) => {
          console.log('top_EX =>' + `exit process -${code} - ${signal}`);
          resolve(false)
        });
      }
    })

  },


  async getList(zhpath) {
    let filedata = fs.readFileSync(zhpath).toString();
    let list = filedata.split('\r\n')
    let zhlist = []
    for (let i = 0; i < list.length; i++) {
      let zh = list[i].split('----')
      if (zh.length == 2) {
        zhlist.push({ zh: zh[0], cookie: zh[1], count: 0 })
      }
    }
    return zhlist
  }
}