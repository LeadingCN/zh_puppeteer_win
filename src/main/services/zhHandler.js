import { ipcMain, dialog, BrowserWindow, app } from 'electron'
const request = require('request-promise-native')
const fs = require('fs')
const path = require('path')
const { spawn } = require("child_process");
const apihost = 'http://127.0.0.1:3000' //'http://z.yyeth.top' //
export default {//export default
  token: "",
  scriptPath: "",
  async createLink(arg) {
    console.log("处理createLink", arg);
    let { amount, linkcount } = arg;
    for (let i = 0; i < linkcount; i++) {
      //执行拨号网络 断线重连

      //请求服务器获取cmd 参数
      let a = await this.getArg()

      //执行shell 运行nodejs脚本
      let msg = await this.runZhScript(a, amount);
      if (msg) {
        //执行成功,更新数据库
        //请求服务器更新数据库
        if (this.token == '') {
          //读取token.json
          let t = fs.readFileSync(path.join('C:/userList', 'token.json'))
          this.token = JSON.parse(t).token
        }
        console.log(`zh=${msg.zh}&link=${msg.pay_link}&quota=${Number(msg.quota) * 100}&oid=${msg.oid}&zid=${msg.zid}`);
        //'${msg.zh}',${Number(msg.quota) * 100},'${msg.pay_link}',0,now(),1,'${msg.oid}','${msg.zid}'
        let u = await request.get({ url: apihost + '/api/getonecreate' + `?token=${this.token}&action=savelink&zh=${msg.zh}&pay_link=${msg.pay_link}&quota=${Number(msg.quota) * 100}&oid=${msg.oid}&zid=${msg.zid}` })
        u = JSON.parse(u)
        if (u.data == 'ok') {
          console.log('更新数据库成功')
        }
      }
    }
    //return 'ok'
  },
  async bohao() {
    /**
     * 开始拨号命令：Rasdial 宽带连接 abc（账号） 123（密码）

断开拨号命令：Rasdial 宽带连接 /disconnect

断开网络连接：rasphone -h 宽带连接
     * 
     */
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
        });
        return subchild;
      }
    })

  },
}