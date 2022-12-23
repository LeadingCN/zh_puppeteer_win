<template>
  <div class="app-container" v-loading="loading">
    <el-switch style="margin-left:20px" v-model="localmodel" active-text="本地模式" inactive-text="云端模式"
      @change="localmodelChange">
    </el-switch>

    <div style="margin-bottom: 20px;display: flex;align-items: center;justify-content: flex-start;">
      <div style="width:auto;margin-left: 20px;">
        <el-input style="width: 150px;" v-model="amount" placeholder="链接金额" :maxlength="4" :minlength="1"></el-input>
        <el-input style="width: 150px;" v-model="linkcount" placeholder="链接数量" :maxlength="3" :minlength="1"></el-input>
        <el-button size="small" @click="createLink()">
          生成
        </el-button>
      </div>
    </div>
    <div v-show="tableshow" class="table-container">
      <el-table :data="datalist" border stripe ref="list" style="width: auto" height="550"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" align="center" width="40">
        </el-table-column>
        <el-table-column type="index" align="center" width="60" label="#">
        </el-table-column>
        <el-table-column prop="zh" label="账号" width="auto">
        </el-table-column>
        <el-table-column prop="count" label="已生成数量" width="auto">
          <template slot-scope="scope">
            <div>{{ scope.row.count ? scope.row.count : 0 }}</div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";
import axios from 'axios';
import dayjs from 'dayjs';
export default {
  data() {
    return {
      amount: '',
      linkcount: "",
      loading: false,
      localmodel: false,
      tableshow: false,
      multipleSelection: [],
      datalist: [{ zh: '123' }, { zh: "456" }]
    }
  },
  async created() {
    //获取已连接的账号 并新建tab渲染数据
    let res = await ipcRenderer.invoke('getlist', { model: 'local' });
    //console.log("账号列表", res);
    if (res) {
      this.datalist = res;
    }
  },
  mounted() {
    //监听信息
    ipcRenderer.on('msg', async (event, arg) => {
      switch (arg.event) {
        case '拨号超时':
          this.$message.error('拨号超时');
          break;
        case '重连成功':
          this.$message.success(arg.ip);
          break;
        case 'outtime':
          this.$message.error('脚本超时或要验证');
          break;
        case 'succss':
          this.$message.success(`${arg.data.zh} 创建成功`);
          //为 datalist 中的 zh === arg.data.zh 的数据的 count +1
          this.datalist.forEach(item => {
            if (item.zh === arg.data.zh) {
              item.count = item.count ? item.count + 1 : 1;
            }
          })
          break;
        case 'ipisuse':
          this.$message.error('ip已被使用,本次账号生成跳过');
          break
        case 'zherr':
          this.$message.error('云端获取账号出错');
          break
        case 'savelinkerr':
          this.$message.error('保存链接出错 已将链接保存本地,请检查账号在云端是否存在或者服务器是否正常访问');
          break
        default:
          break;
      }
      console.log('信息触发', arg)
    })
    //console.log("挂载完成查看", this.loginstatus);
  },
  destroyed() {
    console.log("销毁监听");
    ipcRenderer.removeAllListeners('msg')

  },
  methods: {
    async createLink() {
      let a = Number(this.amount)
      let l = Number(this.linkcount)
      if (a && a > 0 && l && l > 0) {
        if (!this.localmodel) {
          console.log(`从数据库中 生成金额${a}链接 ${l}条`);
          ipcRenderer.invoke('createLink', { amount: a, linkcount: l, model: 'cloud' });
        } else {
          ipcRenderer.invoke('createLink', { amount: a, linkcount: l, model: 'local', data: this.multipleSelection });
          console.log(`从本地文件中 生成金额${a}链接 ${l}条`);
        }
      } else {
        this.$message.error('金额和数量不能为空')
      }
    },
    handleSelectionChange(e) {
      this.multipleSelection = e;
      //console.log("当前选择项", this.multipleSelection);
    },
    localmodelChange() {
      this.tableshow = !this.tableshow
    }
  }
}
</script>

<style scoped>
.line {
  text-align: center;
}
</style>

