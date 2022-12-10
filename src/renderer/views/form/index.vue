<template>
  <div class="app-container" v-loading="loading">
    <div style="margin-bottom: 20px;display: flex;align-items: center;justify-content: flex-start;">
      <el-button size="small" @click="addTab(editableTabsValue)">
        新增
      </el-button>
      <el-switch style="margin-left:20px" v-model="MsgModle" active-text="屏蔽接收" inactive-text="开放接收"
        @change="MsgModleChange">
      </el-switch>
      <el-switch style="margin-left:20px" v-model="MsgNtf" active-text="打开通知" inactive-text="关闭通知" @change="MsgChange">
      </el-switch>
      <div style="width:auto;margin-left: 20px;">
        <el-input style="width: 300px;" v-model="groupKeyword" placeholder="屏蔽模式下 群组名随机关键字" :maxlength="10"
          :minlength="4"></el-input>
        <el-button size="small" @click="saveGroupKeyword()">
          保存群组随机关键字
        </el-button>
      </div>
    </div>
    <el-tabs v-model="editableTabsValue" type="card" @tab-remove="removeTab" @tab-click="checkAccount">
      <el-tab-pane v-for="(item, index) in editableTabs" :key="item.name" :label="item.title" :name="item.name"
        :closable="item.title == '默认' ? false : true">
        <div v-if="loginstatus[nowindex].status == '获取列表'">
          <el-button v-for=" item, index in userList" :key="index" type="text" @click="userLogin(item)">
            {{ userinfo[item] ? item + '已登录' : item }}
          </el-button>
          <el-button type="text" @click="getQrcode">新增登录</el-button>
          <el-button type="text" @click="alllogin">一键登录全部</el-button>
        </div>
        <div v-else-if="loginstatus[nowindex].status == '登录成功'" style="display:flex;justify-content: flex-start;">
          <div style="width: 40%;">
            <el-tabs v-model="activeName" type="card" @tab-click="handleClick" :stretch="true">
              <el-tab-pane name="now">
                <span slot="label">{{ nowlabel }}</span>

                <div class="table-container">
                  <el-table :data="allsessionlist[nowindex]" border stripe ref="list" style="width: auto" height="550"
                    @row-click="sessionHandleClick">
                    <el-table-column type="selection" align="center" width="40">
                    </el-table-column>
                    <el-table-column type="index" align="center" width="40" label="#">
                    </el-table-column>
                    <el-table-column prop="avatar" label="头像" width="75">
                      <template slot-scope="scope">
                        <div>
                          <el-avatar v-if="scope.row.avatar && scope.row.avatar != ''"
                            :src="scope.row.avatar.replace('https', 'http')" fit="contain "
                            style="width: 50px; height: 50px"></el-avatar>
                          <el-avatar v-else style="width: 50px; height: 50px" icon="el-icon-user-solid"></el-avatar>
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column prop="name" label="名字" width="auto">
                    </el-table-column>
                    <el-table-column prop="number" label="号码" width="auto">

                    </el-table-column>
                    <el-table-column prop="newmsg" label="消息提示" width="auto">
                      <template slot-scope="scope">
                        <div v-if="scope.row.newmsg > 0" style="color:red;">{{ scope.row.newmsg }}</div>
                        <div v-else>{{ scope.row.newmsg }}</div>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>

              </el-tab-pane>
              <el-tab-pane name="group">
                <span slot="label">{{ grouplabel }}</span>

                <el-table :data="grouplist[nowindex]" border stripe ref="grouplist" style="width: 100%" height="550"
                  @row-click="sessionHandleClick" @selection-change="handleSelectionChange">
                  <el-table-column type="selection" align="center" width="60">
                  </el-table-column>
                  <el-table-column type="index" align="center" width="40" label="#">
                  </el-table-column>
                  <el-table-column prop="avatar" label="头像" width="75">
                    <template slot-scope="scope">
                      <div>
                        <el-avatar v-if="scope.row.avatar && scope.row.avatar != ''"
                          :src="scope.row.avatar.replace('https', 'http')" fit="contain "
                          style="width: 50px; height: 50px"></el-avatar>
                        <el-avatar v-else style="width: 50px; height: 50px" icon="el-icon-user-solid"></el-avatar>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="name" label="群组名" width="auto">
                  </el-table-column>
                  <el-table-column prop="newmsg" label="消息提示" width="auto">
                    <template slot-scope="scope">
                      <div v-if="scope.row.newmsg > 0" style="color:red;">{{ scope.row.newmsg }}</div>
                      <div v-else>{{ scope.row.newmsg }}</div>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="全部会话" name="all">全部会话</el-tab-pane>

              <el-tab-pane name="friend">
                <span slot="label">{{ friendlabel }}</span>
                <el-table :data="friendlist[nowindex]" border stripe ref="list" style="width: 100%" height="550"
                  @row-click="sessionHandleClick">
                  <el-table-column type="selection" align="center" width="40">
                  </el-table-column>
                  <el-table-column type="index" align="center" width="40" label="#">
                  </el-table-column>
                  <el-table-column prop="avatar" label="头像" width="75">
                    <template slot-scope="scope">
                      <div>
                        <el-avatar v-if="scope.row.avatar && scope.row.avatar != ''"
                          :src="scope.row.avatar.replace('https', 'http')" fit="contain "
                          style="width: 50px; height: 50px"></el-avatar>
                        <el-avatar v-else style="width: 50px; height: 50px" icon="el-icon-user-solid"></el-avatar>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="name" label="名字" width="auto">
                  </el-table-column>
                  <el-table-column prop="number" label="号码" width="auto">

                  </el-table-column>
                  <el-table-column prop="newmsg" label="消息提示" width="auto">
                    <template slot-scope="scope">
                      <div v-if="scope.row.newmsg > 0" style="color:red;">{{ scope.row.newmsg }}</div>
                      <div v-else>{{ scope.row.newmsg }}</div>
                    </template>
                  </el-table-column>
                </el-table>

              </el-tab-pane>
            </el-tabs>
          </div>
          <div style="margin-left:30px;">
            <div style="font-size:x-large;font-weight: 600;">{{ groupSend ? groupSend : nowsession.gid_high ?
                '群聊: ' + nowsession.name :
                nowsession.name ? '私聊:' + nowsession.name : '未选择会话'
            }}</div>
            <JwChat :taleList="list" @enter="bindEnter" :scrollType="'scroll'" @clickTalk="talkEvent" v-model="inputMsg"
              :toolConfig="tool" :quickList="quickList">
              <template slot="tools">
                <div style="width:20rem;text-align:right;" @click="toolEvent('自定义')">
                </div>
              </template>
            </JwChat>

            <el-button @click="groupSend = '群发'">群发</el-button>
            <el-button @click="actionReq('close')">断开</el-button>
            <el-button @click="actionReq('reconnect')">重连</el-button>
            <el-button @click="actionReq('group')">更新群组</el-button>
            <el-button @click="actionReq('friends')">更新好友</el-button>
            <el-button @click="actionReq('nowsession')">更新全部会话</el-button>

          </div>
        </div>
        <div v-else-if="loginstatus[nowindex].status == '扫码登录'">
          <div>{{ nowindex + '' + loginstatus[nowindex].status }}</div>
          <el-image style="width: 100px; height: 100px" :src="qrurl"></el-image>
        </div>
        <div v-else>{{ loginstatus[nowindex].status }}</div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";
import axios from 'axios';
import dayjs from 'dayjs';
import webpack from '../../api/bot.js';
export default {
  data() {
    return {
      MsgNtf: true,
      groupSend: false,
      groupKeyword: "",
      //过滤
      filtersArr: [{ value: "" }],
      //多选
      multipleSelection: [],
      nowindex: '0',
      dayjs,
      loading: true,
      loginstatus: [{ status: "获取列表" }],//登录状态
      editableTabsValue: '0',
      editableTabs: [{
        title: '默认',
        name: '0',
        content: 'Tab 1 content'
      }],
      tabIndex: 0,
      activeName: 'now',
      //二维码
      MsgModle: false,//接收信息模式
      qrurl: '',
      //聊天框
      inputMsg: '',
      list: [],
      //tabs
      nowlabel: "当前会话",
      grouplabel: "群组",
      alllabel: "全部会话",
      friendlabel: "好友列表",
      //好友 / 群组 / 所有会话 列表
      userList: [],//已经登录的账号 通过进程获取
      userinfo: [],//登录的账号信息 
      allsessionlist: [],
      friendlist: [],
      grouplist: [],
      tool: {
        callback: this.toolEvent,
        show: ['file'],
      },
      nowsession: {},
      quickList: [
        { text: '这里是jwchat，您想了解什么问题。' },
        { text: 'jwchat是最好的聊天组件' },
        { text: '谁将烟焚散，散了纵横的牵绊；听弦断，断那三千痴缠。' },
        { text: '长夏逝去。山野间的初秋悄然涉足。' },
        { text: '江南风骨，天水成碧，天教心愿与身违。' },
        { text: '总在不经意的年生。回首彼岸。纵然发现光景绵长。' },
        { text: '外面的烟花奋力的燃着，屋里的人激情的说着情话' },
        { text: '假如你是云，我就是雨，一生相伴，风风雨雨；' },
        { text: '即使泪水在眼中打转，我依旧可以笑的很美，这是你学不来的坚强。' },
        { text: ' 因为不知来生来世会不会遇到你，所以今生今世我会加倍爱你。' },
      ]
    }
  },
  async created() {
    //监听信息
    ipcRenderer.on('msg', async (event, arg) => {
      switch (arg.action) {
        case 'connectError':
          this.$message.error('连接失败' + arg.data);
          break;
        case 'close':

          if (this.MsgNtf) this.$message.error(`${arg.data} | ${this.userinfo[arg.data].uid} 已经断开链接,自动重连中`);

          let reconnectR = await ipcRenderer.invoke('actionreq', { action: 'reconnect', data: this.userinfo[arg.data] })
          if (typeof reconnectR != 'string' && reconnectR) {
            if (this.MsgNtf) this.$message.success(`${arg.data} | ${this.userinfo[arg.data].uid} 重连成功`);
          } else if (typeof reconnectR != 'string' && !reconnectR) {
            if (this.MsgNtf) this.$message.error(`${arg.data} | ${this.userinfo[arg.data].uid} 重连失败`);
          }

          break;
        default:
          break;
      }
      console.log('信息触发', arg)
    })
    ipcRenderer.on('newsession', (event, arg) => {//推送新会话
      console.log("推送新会话", arg);
      arg.newsession.forEach(item => {

        this.allsessionlist[Number(arg.index)].push(item)
      })
    })
    ipcRenderer.on('friends', (event, arg) => {
      console.log("更新好友列表", arg);
      this.friendlist[Number(arg.index)] = arg.friends;
    })
    ipcRenderer.on('userinfo', (event, arg) => {
      console.log("更新账号信息", arg);
      this.loginstatus[Number(arg.index)].status = '登录成功';
      this.loginstatus[this.nowindex].status = '登录成功'
      this.userinfo[arg.index] = arg.tobj;
      this.userinfo[arg.tobj['uid']] = arg.tobj;
      ipcRenderer.invoke('updateall', arg.index)
    })
    ipcRenderer.on('notifyTypeToDataMaps', (event, arg) => {
      console.log("更新全部会话", arg);

    })
    ipcRenderer.on('P2P', (event, arg) => {
      console.log("更新当前会话", arg);
      this.allsessionlist[Number(arg.index)] = arg.allsession;
    })
    ipcRenderer.on('group', (event, arg) => {
      console.log("更新群组会话", arg);
      this.grouplist[Number(arg.index)] = arg.group
    })
    ipcRenderer.on('MsgNtf', (event, arg) => {
      console.log("消息通知", arg);

      if (this.MsgNtf) this.$message({
        message: arg.type == 0 ? `收到一条私聊消息\r\n${arg.index}账号 ${arg.fromuid}  信息内容: ${arg.msg.imgurl ? '图片' : arg.msg}` :
          arg.type == 1 ? `收到一条群消息\r\n ${arg.index}账号 ${arg.groupname} 收到 ${arg.fromname} 发送的消息: ${arg.msg.imgurl ? '图片' : arg.msg}` :
            "收到一条会话消息",
        type: 'success'
      });
      //处理消息渲染
      //如何push到指定session中的list 

      if (arg.type == 0) {
        //私人会话
        console.log("私人会话", arg.fromuid, '本地列表', this.allsessionlist[arg.index]);
        let index = this.allsessionlist[arg.index].findIndex(item => item.number == arg.fromuid)
        console.log('消息通知 符合的index', index);
        if (index != -1) {
          this.nowlabel = '当前会话(新)'
          let tm = {}
          if (arg.msg.imgurl) {
            tm = {
              "date": dayjs().format('YYYY-MM-DD HH:mm:ss'),
              "text": { "text": "<img data-src='" + arg.msg.imgurl.replace('https', 'http') + "'/>" },
              "mine": false,
              "name": this.allsessionlist[arg.index][index].name,
              "img": this.allsessionlist[arg.index][index].avatar ? this.allsessionlist[arg.index][index].avatar : "/image/three.jpeg"
            }
          } else {
            tm = {
              "date": dayjs().format('YYYY-MM-DD HH:mm:ss'),
              "text": { "text": arg.msg },
              "mine": false,
              "name": this.allsessionlist[arg.index][index].name,
              "img": this.allsessionlist[arg.index][index].avatar ? this.allsessionlist[arg.index][index].avatar : "/image/three.jpeg"
            }
          }
          this.allsessionlist[arg.index][index].list.push(tm)
          this.allsessionlist[arg.index][index].newmsg++;
        } else {
          //查找好友列表
          index = this.friendlist[arg.index].findIndex(item => item.number == arg.fromuid)
          if (index != -1) {
            this.friendlabel = '好友(新)'
            let tm = {}
            if (arg.msg.imgurl) {
              tm = {
                "date": dayjs().format('YYYY-MM-DD HH:mm:ss'),
                "text": { "text": "<img data-src='" + arg.msg.imgurl.replace('https', 'http') + "'/>" },
                "mine": false,
                "name": this.friendlist[arg.index][index].name,
                "img": this.friendlist[arg.index][index].avatar ? this.friendlist[arg.index][index].avatar : "/image/three.jpeg"
              }
            } else {
              tm = {
                "date": dayjs().format('YYYY-MM-DD HH:mm:ss'),
                "text": { "text": arg.msg },
                "mine": false,
                "name": this.friendlist[arg.index][index].name,
                "img": this.friendlist[arg.index][index].avatar ? this.friendlist[arg.index][index].avatar : "/image/three.jpeg"
              }
            }
            this.friendlist[arg.index][index].list.push(tm)
            this.friendlist[arg.index][index].newmsg++;
          }
        }


      } else if (arg.type == 1) {
        //群组
        let index = this.grouplist[arg.index].findIndex(item => item.name == arg.groupname)
        if (index == -1) return
        this.grouplabel = '群组(新)'
        let tm = {}
        if (arg.msg.imgurl) {
          tm = {
            "date": dayjs().format('YYYY-MM-DD HH:mm:ss'),
            "text": { "text": "<img data-src='" + arg.msg.imgurl.replace('https', 'http') + "'/>" },
            "mine": false,
            "name": this.allsessionlist[arg.index][index].name,
            "img": this.allsessionlist[arg.index][index].avatar ? this.allsessionlist[arg.index][index].avatar : "/image/three.jpeg"
          }
        } else {
          tm = {
            "date": dayjs().format('YYYY-MM-DD HH:mm:ss'),
            "text": { "text": arg.msg },
            "mine": false,
            "name": this.allsessionlist[arg.index][index].name,
            "img": this.allsessionlist[arg.index][index].avatar ? this.allsessionlist[arg.index][index].avatar : "/image/three.jpeg"
          }
        }
        this.grouplist[arg.index][index].list.push(tm)
        this.grouplist[arg.index][index].newmsg++;
      }
    })
    this.getUserList(0)//获取登录列表
    this.loading = false;
    this.MsgModleChange('get')
    let c = await ipcRenderer.invoke('config', { action: "get" });
    console.log(c);
    if (c.config) {
      this.groupKeyword = c.config.groupKeyword
    }
    //获取已连接的账号 并新建tab渲染数据

  },
  mounted() {
    console.log("挂载完成查看", this.loginstatus);
  },
  destroyed() {
    console.log("销毁监听");
    ipcRenderer.removeAllListeners('msg')
    ipcRenderer.removeAllListeners('friends')
    ipcRenderer.removeAllListeners('userinfo')
    ipcRenderer.removeAllListeners('notifyTypeToDataMaps')
    ipcRenderer.removeAllListeners('P2P')
    ipcRenderer.removeAllListeners('group')
    ipcRenderer.removeAllListeners('MsgNtf')

  },
  methods: {
    //一键全部登录
    async alllogin() {
      for (let i = 0; i < this.userList.length; i++) {
        //新开一个tab
        await this.addTab(i);
        await this.userLogin(this.userList[i])

      }
    },
    //执行指定操作
    async actionReq(a) {
      let r = null;
      switch (a) {
        case 'close':
          ipcRenderer.invoke('actionreq', { action: a, data: this.nowindex })
          break;
        case 'reconnect':
          r = await ipcRenderer.invoke('actionreq', { action: a, data: this.userinfo[this.nowindex] })
          if (typeof r == 'string' && r == 'ok') {
            this.$message.error('链接正常,请勿重复操作')
          }
          break;
        case 'group':
          r = await ipcRenderer.invoke('actionreq', { action: a, data: this.nowindex })
          break
        case 'friends':
          r = await ipcRenderer.invoke('actionreq', { action: a, data: this.nowindex })
          break
        case 'nowsession':
          r = await ipcRenderer.invoke('actionreq', { action: a, data: this.nowindex })
          break
        default:
          break;
      }
      console.log(r);
      if (typeof r == 'string' && r == 'no') {
        this.$message.error('请先打开屏蔽开关再更新')
      }
    },
    handleSelectionChange(e) {
      this.multipleSelection = e;
      console.log("当前选择项", this.multipleSelection);
    },
    //接收信息模式改变 屏蔽和开放
    async MsgModleChange(e) {

      let r = await ipcRenderer.invoke('MsgModleChange', e);
      if (r.result) {
        this.MsgModle = r.result
      } else if (r) {
        //设置成功
      }
      console.log("改变模式结果", r, '前端结果', this.MsgModle);
    },
    async getUserList(index) {
      let userlist = await ipcRenderer.invoke('getUserlist', index);
      console.log("获取本地已经登录的用户列表", userlist);
      if (typeof userlist == 'string' && userlist == 'online') {
        console.log("登录成功");
        this.loginstatus[this.nowindex].status = '登录成功'
        ipcRenderer.invoke('updateall', index)
      } else {
        if (typeof userlist == 'object' && userlist.length > 0) {
          this.userList = userlist;

        }
      }
    },
    async userLogin(uid) {
      this.loading = true;
      let result = await ipcRenderer.invoke('userLogin', [uid, this.nowindex]);
      if (result) {
        this.loginstatus[this.nowindex].status = '登录成功'
      } else {
        this.$message.error('登录失败')
      }
      this.loading = false;
      return result
    },
    async getQrcode() {
      this.loading = true;
      let result = await ipcRenderer.invoke('getQrcode', this.nowindex);
      if (result.loginKey) {
        this.loginstatus[this.nowindex].status = '扫码登录'
        this.qrurl = `http://qrcode.leipi.org.cn/js.html?qw=350&ql=&lw=NaN&lh=NaN&bor=0&op=img&qc=${result.loginKey}`;
      } else {
        this.$message.error('获取二维码失败')
      }
      this.loading = false;
    },
    //发送消息
    async ipcSendMsg(index, msg, target, sessiontyep) {
      let result = await ipcRenderer.invoke('sendmsg', [index, msg, target, sessiontyep]);
      return result
    },
    //发送图片
    async ipcSendPic(index, pic, target, sessiontyep) {
      let result = await ipcRenderer.invoke('sendpic', [index, pic, target, sessiontyep]);
      return result
    },
    async sleep(delay) {
      return new Promise((resolve) => {
        setTimeout(resolve, delay);
      });
    },
    //保存群组关键字 
    async saveGroupKeyword() {
      let r = await ipcRenderer.invoke('config', { action: "set", data: { groupKeyword: this.groupKeyword } })
      if (r) {
        this.$message.success('保存成功')
      }
    },
    async rungroupSend(msg, type) {
      this.$message.success(`${this.userinfo[this.nowindex].uid} 执行群发...`)
      if (this.multipleSelection.length == 0) {
        this.$message.error('没有勾选群组')
        return
      } else {
        this.loading = true
        for (let i = 0; i < this.multipleSelection.length; i++) {
          if (type == 1) {
            //发送图片
            let msgObj = {
              "date": dayjs().format('YYYY-MM-DD HH:mm:ss'),
              "text": { "text": "<img data-src='" + msg.url.replace('https', 'http') + "'/>" },
              "mine": true,
              "name": this.userinfo[this.nowindex].name,
              "img": this.userinfo[this.nowindex].avatar ? this.userinfo[this.nowindex].avatar : "/image/three.jpeg"
            }
            let r = await this.ipcSendPic(this.nowindex, msg, {
              high: this.multipleSelection[i].gid_high,
              low: this.multipleSelection[i].gid_low,
              unsigned: this.multipleSelection[i].gid_unsigned
            }, '0')
            if (r) {
              this.multipleSelection[i].list.push(msgObj)
              this.$message.success(this.multipleSelection[i].name + '  ' + '群组   发送图片成功');
            } else {
              this.$message.error(this.multipleSelection[i].name + '  ' + '群组   发送图片失败');
            }
          } else {
            //发送信息
            let msgObj = {
              "date": dayjs().format('YYYY-MM-DD HH:mm:ss'),
              "text": { "text": msg },
              "mine": true,
              "name": this.userinfo[this.nowindex].name,
              "img": this.userinfo[this.nowindex].avatar ? this.userinfo[this.nowindex].avatar : "/image/three.jpeg"
            }
            console.log(this.multipleSelection[i]);
            let r = this.ipcSendMsg(this.nowindex, msg, {
              high: this.multipleSelection[i].gid_high,
              low: this.multipleSelection[i].gid_low,
              unsigned: this.multipleSelection[i].gid_unsigned
            }, '0')
            if (r) {
              this.multipleSelection[i].list.push(msgObj)
              this.$message.success(this.multipleSelection[i].name + '  ' + '群组   发送信息成功');
            } else {
              this.$message.error(this.multipleSelection[i].name + '  ' + '群组   发送信息失败');
            }
          }

          let time = parseInt(Math.random() * (1000 - 100 + 1) + 100, 10)
          console.log("随机等待", time);
          await this.sleep(time)
        }
        this.loading = false

      }
    },
    //聊天框方法
    async bindEnter(e) {
      console.log('是否群发', this.groupSend, this.nowsession);
      const msg = this.inputMsg
      if (!msg) return;
      if (this.groupSend) {
        this.rungroupSend(msg, 0)
      } else {
        const msgObj = {
          "date": dayjs().format('YYYY-MM-DD HH:mm:ss'),
          "text": { "text": msg },
          "mine": true,
          "name": this.userinfo[this.nowsession.index].name,
          "img": this.userinfo[this.nowsession.index].avatar ? this.userinfo[this.nowsession.index].avatar : "/image/three.jpeg"
        }
        //进程通讯发送信息
        if (this.nowsession.sessiontype == 1) {//私聊会话
          let r = await this.ipcSendMsg(this.nowsession.index, msg, this.nowsession.uid, this.nowsession.sessiontype);
          if (r) {
            //渲染层聊天记录
            this.list.push(msgObj)
          } else {
            this.$message.error('发送失败')
          }
        } else {//群组会话
          let t = {
            high: this.nowsession.gid_high,
            low: this.nowsession.gid_low,
            unsigned: this.nowsession.gid_unsigned,
          }
          let r = await this.ipcSendMsg(this.nowsession.index, msg, t, this.nowsession.sessiontype);
          if (r) {
            //渲染层聊天记录
            this.list.push(msgObj)
          } else {
            this.$message.error('发送失败')
          }
        }
      }


    },
    MsgChange(e) {
      console.log("通知状态", e);
    },
    //发送图片
    async toolEvent(type, obj) {
      let t = new Date().getTime()
      const min = 1000;                            //最小值
      const max = 9999;                            //最大值
      const range = max - min;                         //取值范围差
      const random = Math.random();                     //小于1的随机数
      var result = min + Math.round(random * range);
      let imgurl = `https://web.botim.me/upd/v1/im/chat/file/2022/desktop${t}${result}.jpg`
      console.log(imgurl);
      console.log('tools', type, obj)
      let WH = await this.getpicWH(obj[0]);
      console.log(WH);
      let formData = new FormData();
      formData.append('file', obj[0], obj[0].name);
      let theader = {
        "Accept": "application/json, text/plain, */*",
        'Accept-Language': 'zh-CN,zh;q=0.9,ja;q=0.8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Content-Type': 'multipart/form-data;',
        'Host': 'web.botim.me',
        'Origin': 'https://web.botim.me',
        'Pragma': 'no-cache',
        'Referer': 'https://web.botim.me/',
        'sec-ch-ua': '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': 'Windows',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
        'x-devtype': 'desktop',
        'X-UID': `${this.userinfo[this.nowindex].uid}`,
        'X-UToken': `${this.userinfo[this.nowindex].token}`
      }
      console.log(theader);
      axios.put(imgurl, formData, {
        headers: theader
      })
        .then(async res => {
          console.log(res);
          if (this.groupSend) {
            this.rungroupSend({ size: obj[0].size, url: imgurl, height: WH.height, width: WH.width }, 1)
          } else {
            let t = {
              "date": dayjs().format('YYYY-MM-DD HH:mm:ss'),
              "text": { "text": "<img data-src='" + imgurl + "'/>" },
              "mine": true,
              "name": this.userinfo[this.nowsession.index].name,
              "img": this.userinfo[this.nowsession.index].avatar ? this.userinfo[this.nowsession.index].avatar : "/image/three.jpeg"
            }
            if (this.nowsession.sessiontype == 1) {//私聊会话
              let r = await this.ipcSendPic(this.nowsession.index, { size: obj[0].size, url: imgurl, height: WH.height, width: WH.width }, this.nowsession.uid, this.nowsession.sessiontype);
              if (r) {
                this.list.push(t)
              }
            } else {
              let tg = {
                high: this.nowsession.gid_high,
                low: this.nowsession.gid_low,
                unsigned: this.nowsession.gid_unsigned,
              }
              let r = await this.ipcSendPic(this.nowsession.index, { size: obj[0].size, url: imgurl, height: WH.height, width: WH.width }, tg, this.nowsession.sessiontype);
              if (r) {
                this.list.push(t)
              }
            }
          }
        })
        .catch(e => {
          this.$message({
            message: '图片发送失败',
            type: 'warning'
          });
        })
      //图片进行上传
    },
    talkEvent(play) {
      console.log(play)
    },
    //右侧群组 用户 好友选择 
    handleClick(tab, event) {
      console.log(tab.index, event);
      if (tab.index == 0) this.nowlabel = '当前会话'
      if (tab.index == 1) this.grouplabel = '群组'
      if (tab.index == 2) this.alllabel = '全部会话'
      if (tab.index == 3) this.friendlabel = '好友列表'

    },
    //点击好友/群组 选择当前聊天对象
    sessionHandleClick(e) {

      this.nowsession = e
      this.groupSend = false
      if (e.gid_high) {
        this.nowsession.sessiontype = 0
      } else {
        this.nowsession.sessiontype = 1
      }
      console.log('点击好友/群组 选择当前聊天对象', e, '当前会话类型', this.nowsession.sessiontype);
      this.nowsession.newmsg = 0;
      //聊天框 list 为当前对象聊天记录
      this.list = this.nowsession.list
    },
    //切换用户
    checkAccount(e) {

      this.nowindex = e.index
      //console.log("切换", this.userList[this.nowindex], this.allsessionlist[this.nowindex], this.friendlist[this.nowindex], this.grouplist[this.nowindex]);
    },
    async addTab(targetName) {
      let newTabName = ++this.tabIndex + '';
      this.nowindex = newTabName
      this.loginstatus[this.tabIndex] = { status: '获取列表' }
      this.editableTabs.push({
        title: newTabName,
        name: newTabName,
        content: 'New Tab content',
      });
      this.editableTabsValue = newTabName;
      await this.getUserList(null)
    },
    removeTab(targetName) {
      this.$confirm("是否要进行该关闭操作?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        let tabs = this.editableTabs;
        let activeName = this.editableTabsValue;
        this.tabIndex--;
        if (activeName === targetName) {
          tabs.forEach((tab, index) => {
            if (tab.name === targetName) {
              let nextTab = tabs[index + 1] || tabs[index - 1];
              if (nextTab) {
                activeName = nextTab.name;
              }
            }
          });
        }

        this.editableTabsValue = activeName;
        this.editableTabs = tabs.filter(tab => tab.name !== targetName);
      });

    },
    //获取图片宽高
    async getpicWH(pic) {
      return new Promise((resolve, reject) => {

        let reader = new FileReader()
        reader.readAsDataURL(pic)
        reader.onload = function (theFile) {
          let img = new Image()
          img.onload = function () {
            // 获取文件上传的宽高
            resolve({ width: img.width, height: img.height })
          }
          img.src = theFile.target.result
        }

      }).catch((e) => {
        console.log(e)
      });

    }
  }
}
</script>

<style scoped>
.line {
  text-align: center;
}
</style>

