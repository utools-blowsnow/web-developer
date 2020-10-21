<template>
  <div class="traceroute">
    <container title="路由跟踪">
      <template slot="head">
        <span  style="margin: 0 10px;">IP/域名: </span>
        <el-input size="mini" style="width: 120px;" v-model="domain" placeholder="IP/域名" @keydown.enter="start"></el-input>
        <el-button size="mini" type="primary" style="margin: 0 10px;" :disabled="status === 1" @click="start">扫描</el-button>
      </template>
      <div style="text-align: left;">
        状态：
        <span v-if="status === 0">就绪</span>
        <span v-if="status === 1">扫描ing</span>
        <span v-if="status === 2">扫描完毕</span>
      </div>
      <el-table
        :data="results"
        style="width: 100%">
        <el-table-column
          type="index"
          label="序号"
          min-width="50">
        </el-table-column>
        <el-table-column
          prop="rtt1"
          label="rtt1"
          min-width="50">
        </el-table-column>
        <el-table-column
          prop="rtt2"
          label="rtt2"
          min-width="50">
        </el-table-column>
        <el-table-column
          prop="rtt3"
          label="rtt3"
          min-width="50">
        </el-table-column>
        <el-table-column
          prop="ip"
          label="ip"
          min-width="50">
        </el-table-column>
      </el-table>
    </container>
  </div>
</template>

<script type="text/ecmascript-6">
  import Container from "../../components/Container";
  export default {
    name: "Traceroute",
    info:{
      label: "路由跟踪",
      logo: "",
      desc: "",
      cmds:[
        {
          "type": "regex",
          "label": "路由跟踪",
          "match": "/^((2(5[0-5]|[0-4]\\d))|[0-1]?\\d{1,2})(\\.((2(5[0-5]|[0-4]\\d))|[0-1]?\\d{1,2})){3}$/"
        },
        {
          "type": "regex",
          "label": "路由跟踪",
          "match": "/(?=^.{4,253}$)(^((?!-)[a-zA-Z0-9-]{1,63}(?<!-)\\.)+[a-zA-Z]{2,63}\\.?$)/"
        }
      ]
    },
    components: {Container},
    data() {
      return {
        results: [],
        status: 0,

        domain: null,

        tracer: null
      }
    },
    methods: {
      setValue(text){
        this.domain = text;
        if (this.status !== 1){
          this.start();
        }
      },
      start() {
        this.status = 1;
        this.results = [];
        try {
          if (!this.tracer){
            this.tracer = window.utils.tracert;
            console.log(this.tracer);
            this.tracer
              .on('hop', (hop) => {
                this.results.push(hop);
                console.log(`hop: ${JSON.stringify(hop)}`);
              })
              .on('close', (code) => {
                this.status = 2;
                console.log(`close: code ${code}`);
              });
          }
          this.tracer.trace(this.domain);
        } catch (ex) {
          console.log(ex);
        }
      }
    },
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
.traceroute {

}
</style>
