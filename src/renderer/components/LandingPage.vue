<template>
  <div id="wrapper">
    <H1>
      欢迎回来
      {{ '当前版本: ' + appversion }}
    </H1>
    <div style="width:auto;margin-left: 20px;">
      <el-input style="width: 300px;" v-model="userPath" placeholder="账号信息路径">
      </el-input>
      <el-button size="small" @click="saveUserPath()">
        保存配置路径
      </el-button>
    </div>
    <div style="width:auto;margin-left: 20px;">
      <el-input style="width: 300px;" v-model="scriptpath" placeholder="脚本路径">
      </el-input>
      <el-button size="small" @click="savescriptPath()">
        保存脚本路径
      </el-button>
    </div>
    <div style="width:auto;margin-left: 20px;">
      <el-input style="width: 300px;" v-model="secret" placeholder="CDKEY">
      </el-input>
      <el-button size="small" @click="savesecret()">
        保存CDKEY
      </el-button>
    </div>
    <el-dialog title="进度" :visible.sync="dialogVisible" :before-close="handleClose" center width="14%" top="45vh">
      <div class="conten">
        <el-progress type="dashboard" :percentage="percentage" :color="colors" :status="progressStaus"></el-progress>
      </div>


    </el-dialog>
  </div>
</template>

<script>
import SystemInformation from "./LandingPage/SystemInformation";
import { message } from "@/api/login";
import { ipcRenderer, shell } from "electron";
export default {
  name: "landing-page",
  components: { SystemInformation },
  data: () => ({
    appversion: "",
    apppath: "",
    updatestatus: "",
    scriptpath: "",
    newdata: {
      name: "yyy",
      age: "12",
    },
    logo: require("@/assets/logo.png"),
    textarray: [],
    percentage: 0,
    colors: [
      { color: "#f56c6c", percentage: 20 },
      { color: "#e6a23c", percentage: 40 },
      { color: "#6f7ad3", percentage: 60 },
      { color: "#1989fa", percentage: 80 },
      { color: "#5cb87a", percentage: 100 },
    ],
    dialogVisible: false,
    progressStaus: null,
    filePath: "",
    userPath: "",
    secret: ""
  }),
  async created() {

    //获取应用版本和路径
    const { version, path } = await ipcRenderer.invoke("get-app-info");
    this.appversion = version;
    this.apppath = path;
    //执行热更新
    ipcRenderer.invoke("hot-update");


    let r = await ipcRenderer.invoke("userPath", { action: 'get' });
    if (r && r.path) {
      this.userPath = r.path;
    }
    let rkey = await ipcRenderer.invoke("config", { action: 'getsecret' });
    console.log('rkey', rkey);
    let spath = await ipcRenderer.invoke("config", { action: 'getscriptpath' });
    if (spath.scriptpath) {
      this.scriptpath = spath.scriptpath;
    }
    console.log('rkey', rkey);
    if (rkey && rkey.secret) {
      this.secret = rkey.secret;
    }
    console.log("环境打印示例");
    console.log(__lib);
    console.log(process.env.TERGET_ENV);
    console.log(process.env);
    ipcRenderer.on("download-progress", (event, arg) => {
      this.percentage = Number(arg);
    });
    ipcRenderer.on("download-error", (event, arg) => {
      if (arg) {
        this.progressStaus = "exception";
        this.percentage = 40;
        this.colors = "#d81e06";
      }
    });
    ipcRenderer.on("download-paused", (event, arg) => {
      if (arg) {
        this.progressStaus = "warning";
        this.$alert("下载由于未知原因被中断！", "提示", {
          confirmButtonText: "重试",
          callback: (action) => {
            ipcRenderer.invoke("satrt-download");
          },
        });
      }
    });
    ipcRenderer.on("download-done", (event, age) => {
      this.filePath = age.filePath;
      this.progressStaus = "success";
      console.log("下载完成啦");
      this.$alert("更新下载完成！", "提示", {
        confirmButtonText: "确定",
        callback: (action) => {
          shell.openPath(this.filePath);
        },
      });
    });
    ipcRenderer.on("update-msg", (event, age) => {
      console.log("update-msg", age);
      switch (age.state) {
        case -1:
          const msgdata = {
            title: "发生错误",
            message: age.msg,
          };
          this.dialogVisible = false;
          ipcRenderer.invoke("open-errorbox", msgdata);
          break;
        case 0:
          this.$message("正在检查更新");
          break;
        case 1:
          this.$message({
            type: "success",
            message: "已检查到新版本，开始下载",
          });
          this.dialogVisible = true;
          break;
        case 2:
          this.$message({ type: "success", message: "无新版本" });
          break;
        case 3:
          this.percentage = age.msg.percent.toFixed(1);
          break;
        case 4:
          this.progressStaus = "success";
          this.$alert("更新下载完成！", "提示", {
            confirmButtonText: "确定",
            callback: (action) => {
              ipcRenderer.invoke("confirm-update");
            },
          });
          break;

        default:
          break;
      }
    });
    ipcRenderer.on('hot-update-status', (event, arg) => {
      console.log(arg);
      this.dialogVisible = true
      if (arg.status === 'finished') {
        this.updatestatus = '更新成功,请重新启动应用,即将自动关闭';
        setTimeout(() => {
          ipcRenderer.invoke("close-app");
        }, 5000);
        this.percentage = 100;
        //this.dialogVisible = false
        // this.$message({
        //   type: 'success',
        //   message: '热更新成功'
        // });
      }
      if (arg.status === 'downloading') {
        this.dialogVisible = true;
        this.percentage = 20;
        // this.$message({
        //   type: 'success',
        //   message: '下载中'
        // });
      }

      if (arg.status === 'extracting') {
        this.percentage = 40;
        // this.$message({
        //   type: 'success',
        //   message: '解压中'
        // });
      }
      if (arg.status === 'remove') {
        this.percentage = 60;
        // this.$message({
        //   type: 'success',
        //   message: '删除旧文件'
        // });
      }
      if (arg.status === 'moving') {
        this.percentage = 80;
        // this.$message({
        //   type: 'success',
        //   message: '正在迁移'
        // });
      }
      if (arg.status === 'failed') {
        this.percentage = 100;
        this.updatestatus = '更新失败,请联系管理员';
        this.$message({
          type: 'error',
          message: '更新失败'
        });
      }
    })
  },
  methods: {
    openNewWin() {
      let data = {
        url: "/form/index",
        resizable: true,
      };
      ipcRenderer.invoke("open-win", data);
    },
    openDocument() {
      shell.openExternal("https://zh-sky.gitee.io/electron-vue-template-doc/Overview/#%E5%8A%9F%E8%83%BD")
    },
    getMessage() {
      message().then((res) => {
        this.$alert(res.data, "提示", {
          confirmButtonText: "确定",
        });
      });
    },
    StopServer() {
      ipcRenderer.invoke("stop-server").then((res) => {
        this.$message({
          type: "success",
          message: "已关闭",
        });
      });
    },
    StartServer() {
      ipcRenderer.invoke("statr-server").then((res) => {
        if (res) {
          this.$message({
            type: "success",
            message: res,
          });
        }
      });
    },
    // 获取electron方法
    open() { },
    CheckUpdate(data) {
      switch (data) {
        case "one":
          ipcRenderer.invoke("check-update").then((res) => {
            console.log("启动检查");
          });

          break;
        case "two":
          ipcRenderer.invoke("start-download").then(() => {
            this.dialogVisible = true;
          });

          break;

        default:
          break;
      }
    },
    handleClose() {
      //关闭应用

      this.dialogVisible = false;
    },
    changeLanguage() {
      let lang = this.$i18n.locale === "zh-CN" ? "en" : "zh-CN";
      this.$i18n.locale = lang;
    },
    async saveUserPath() {
      let r = await ipcRenderer.invoke("userPath", { action: 'set', path: this.userPath });
      if (r) {
        this.$message.success('保存成功')
      }
    },
    async savesecret() {
      let r = await ipcRenderer.invoke("config", { action: 'savesecret', key: this.secret });
      if (r) {
        this.$message.success('保存成功')
      } else {
        this.$message.error('保存失败')
      }
    },
    async savescriptPath() {
      let r = await ipcRenderer.invoke("config", { action: 'savescriptpath', scriptpath: this.scriptpath });
      if (r) {
        this.$message.success('保存成功')
      } else {
        this.$message.error('保存失败')
      }
    }
  },
  destroyed() {
    console.log("销毁了哦");
    ipcRenderer.removeAllListeners("confirm-message");
    ipcRenderer.removeAllListeners("download-done");
    ipcRenderer.removeAllListeners("download-paused");
    ipcRenderer.removeAllListeners("confirm-stop");
    ipcRenderer.removeAllListeners("confirm-start");
    ipcRenderer.removeAllListeners("confirm-download");
    ipcRenderer.removeAllListeners("download-progress");
    ipcRenderer.removeAllListeners("download-error");
    ipcRenderer.removeAllListeners("update-msg");
  },
  computed: {
    text() {
      return this.$i18n.t("waitDataLoading");
    },
  },
};
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Source Sans Pro", sans-serif;
}

#wrapper {
  padding: 60px 80px;
}

#logo {
  height: auto;
  margin-bottom: 20px;
  width: 420px;
}

main {
  display: flex;
  justify-content: space-between;
}

main>div {
  flex-basis: 50%;
}

.left-side {
  display: flex;
  flex-direction: column;
}

.welcome {
  color: #555;
  font-size: 23px;
  margin-bottom: 10px;
}

.title {
  color: #2c3e50;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 6px;
}

.title.alt {
  font-size: 18px;
  margin-bottom: 10px;
}

.doc {
  margin-bottom: 10px;
}

.doc p {
  color: black;
  margin-bottom: 10px;
}

.doc .el-button {
  margin-top: 10px;
  margin-right: 10px;
}

.doc .el-button+.el-button {
  margin-left: 0;
}

.conten {
  text-align: center;
}
</style>
