<template>
  <div class="app-container" v-loading="loading">
    <div style="margin-bottom: 20px;display: flex;align-items: center;justify-content: flex-start;">



      <div style="width:auto;margin-left: 20px;">
        <el-input style="width: 150px;" v-model="amount" placeholder="链接金额" :maxlength="4" :minlength="1"></el-input>
        <el-input style="width: 150px;" v-model="linkcount" placeholder="链接数量" :maxlength="3" :minlength="1"></el-input>
        <el-button size="small" @click="createLink()">
          生成
        </el-button>
      </div>
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
      loading: false
    }
  },
  async created() {

    //获取已连接的账号 并新建tab渲染数据

  },
  mounted() {

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
        console.log(`生成金额${a}链接 ${l}条`);
        let r = await ipcRenderer.invoke('createLink', { amount: a, linkcount: l });

      } else {
        this.$message.error('金额和数量不能为空')
      }
    }
  }
}
</script>

<style scoped>
.line {
  text-align: center;
}
</style>

