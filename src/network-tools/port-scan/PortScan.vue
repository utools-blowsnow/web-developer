<template>
  <div class="port-scan">
    <container title="端口扫描" >
      <template slot="head">
        <span  style="margin: 0 10px;">IP: </span>
        <el-input size="mini" style="width: 120px;" v-model="ip" placeholder="ip"></el-input>
        端口：
        <el-input-number controls-position="right" :min="1" size="mini" style="width: 120px;" v-model="startPort" placeholder="开始端口"></el-input-number>
        <span style="margin: 0 10px;"> - </span>
        <el-input-number controls-position="right" :min="1" size="mini" style="width: 120px;" v-model="endPort" placeholder="结束端口"></el-input-number>

        <span  style="margin: 0 10px;">超时时间：</span>
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
          prop="port"
          label="端口"
          min-width="180">
        </el-table-column>
        <el-table-column
          label="状态"
          min-width="180">
          <template slot-scope="scope">
            开启
          </template>
        </el-table-column>
      </el-table>
    </container>
  </div>
</template>

<script type="text/ecmascript-6">
  import Container from "../../components/Container";
  export default {
    name: "PortScan",
    components: {Container},
    data() {
      return {
        contents: [],
        startPort: 1,
        endPort: 2000,
        timeout: 2000,

        ip: null,
        // 0 就绪 1开始ing 2结束
        status: 0,

        lastText: null
      }
    },
    methods: {
      setValue(text){
        this.ip = text;
        if (this.status !== 1){
          this.start(text);
        }
      },
      start() {
        this.status = 1;
        this.contents = [];

        window.utils.scan(this.ip,this.startPort,this.endPort,this.timeout,()=>{
          this.status = 2;
        },(port)=>{
          this.contents.push({port: port});
        })
      }
    },
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .port-scan {

  }
</style>
