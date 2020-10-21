<template>
  <div class="local-scan">
    <container title="局域网扫描" >
      <template slot="head">
        <span style="margin: 0 10px;">开始网段：</span>
        <el-input size="mini" style="width: 120px;" v-model="startIp" placeholder="开始网段"></el-input>
        <span style="margin: 0 10px;">端口：</span>
        <el-input-number controls-position="right" :min="1" size="mini" style="width: 120px;" v-model="port" placeholder="端口"></el-input-number>
        <span style="margin: 0 10px;">扫描数量: </span>
        <el-input-number controls-position="right" :min="1" :max="255" size="mini" style="width: 120px;" v-model="num" placeholder="扫描数量"></el-input-number>

        <span style="margin: 0 10px;">超时时间：</span>
        <el-input-number controls-position="right" :min="1" size="mini" style="width: 120px;" v-model="timeout" placeholder="毫秒"></el-input-number>
        <el-button size="mini" type="primary" style="margin: 0 10px;" :disabled="status === 1" @click="start">扫描</el-button>
      </template>
      <div style="text-align: left;">
        状态：
        <span v-if="status === 0">就绪</span>
        <span v-if="status === 1">扫描ing</span>
        <span v-if="status === 2">扫描完毕</span>

      </div>
      <el-table
        :data="contents"
        style="width: 100%">
        <el-table-column
          prop="ip"
          label="ip"
          min-width="180">
        </el-table-column>
        <el-table-column
          label="状态"
          min-width="180">
          <template slot-scope="scope">
            存活
          </template>
        </el-table-column>
      </el-table>
    </container>
  </div>
</template>

<script type="text/ecmascript-6">
  import Container from "../../components/Container";
  export default {
    name: "LocalScan",
    info:{
      label: "局域网扫描",
      logo: "",
      desc: "",
      cmds:[
        {
          "type": "regex",
          "label": "局域网扫描",
          "match": "/^((2(5[0-5]|[0-4]\\d))|[0-1]?\\d{1,2})(\\.((2(5[0-5]|[0-4]\\d))|[0-1]?\\d{1,2})){3}$/"
        }
      ]
    },
    components: {Container},
    data() {
      return {
        contents: [],
        startIp: '192.168.1',
        port: 80,
        num: 255,
        timeout: 2000,

        // 0 就绪 1开始ing 2结束
        status: 0,

        lastText: null
      }
    },
    methods: {
      setValue(text){
        this.startIp = text;

        if (this.status !== 1){
          this.start(text);
        }
      },
      start() {
        let arr = this.startIp.split(".");
        console.log(arr);
        if (arr.length === 4){
          this.startIp = this.startIp.substring(0,this.startIp.lastIndexOf("."));
        }


        this.status = 1;
        this.contents = [];

        let count = this.num;
        for (let i = 1; i <= this.num; i++) {
          let ip = this.startIp + "." + i;
          window.utils.scan(ip,this.port,this.port,this.timeout,()=>{
            count--;
            console.log(count);
            if (count === 0) {
              this.status = 2;
            }
          },()=>{
            this.contents.push({
              ip: ip
            })
          })
        }
      }
    },
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .local-scan {

  }
</style>
