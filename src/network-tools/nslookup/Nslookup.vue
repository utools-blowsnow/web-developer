<template>
  <div class="nslookup">
    <container title="nslookup">
      <template slot="head">
        <span  style="margin: 0 10px;">IP/域名: </span>
        <el-input size="mini" style="width: 120px;" v-model="domain" placeholder="IP/域名" @keydown.enter="start"></el-input>
        <el-select @change="start" size="mini" style="width: 140px;margin-left: 20px;" v-model="type" >
          <el-option
            v-for="item in types"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <span  style="margin: 0 10px;">指定的DNS服务器: </span>
        <el-input size="mini" style="width: 120px;" v-model="dns" placeholder="指定的DNS服务器" @keydown.enter="start"></el-input>
        <el-button size="mini" type="primary" style="margin: 0 10px;" :disabled="status === 1" @click="start">扫描</el-button>
      </template>
      <div style="text-align: left;">
        状态：
        <span v-if="status === 0">就绪</span>
        <span v-if="status === 1">扫描ing</span>
        <span v-if="status === 2">扫描完毕</span>
      </div>
      <pre style="text-align: left;">
        {{results}}
      </pre>
    </container>
  </div>
</template>

<script type="text/ecmascript-6">
  import Container from "../../components/Container";
  export default {
    name: "Nslookup",
    components: {Container},
    data() {
      return {
        results: "",
        status: 0,

        domain: null,
        dns: null,
        type: "A",
        types:[
          {label: "地址记录(Ipv4)",value: "A"},
          {label: "地址记录(Ipv6)",value: "AAAA"},
          {label: "别名记录(CNAME)",value: "CNAME"},
          {label: "邮件服务器(MX)",value: "MX"},
          {label: "名字服务器(NX)",value: "NX"},
          {label: "文本信息(TXT)",value: "TXT"}
        ],
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
        this.results = "";
        this.status = 1;
        try {
          if (!this.tracer){
            this.tracer = window.utils.nslookup;
            this.tracer
              .on('hop', (hop) => {
                this.results += hop + "\n";
                console.log(`hop: ${JSON.stringify(hop)}`);
              })
              .on('close', (code) => {
                this.status = 2;
                console.log(`close: code ${code}`);
              });
          }
          if (this.dns){
            this.tracer.trace(["-querytype="+this.type,this.domain,this.dns]);
          }else{
            this.tracer.trace(["-querytype="+this.type,this.domain]);
          }
        } catch (ex) {
          console.log(ex);
        }
      }
    },
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
.nslookup {

}
</style>
