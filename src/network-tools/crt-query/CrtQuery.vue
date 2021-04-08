<template>
  <div class="CrtQuery">
    <container title="证书查询">
      <template slot="head">
        <span style="margin: 0 10px;">域名：</span>
        <el-input size="mini" style="width: 120px;" v-model="lastText"
                  placeholder="域名"></el-input>
        <el-button size="mini" type="primary" style="margin: 0 10px;" @click="changeApi">查询
        </el-button>
      </template>
      <div v-html="results" style="text-align: left;"></div>
    </container>
  </div>
</template>

<script type="text/ecmascript-6">
import Container from "../../components/Container";

export default {
  name: "CrtQuery",
  info: {
    label: "证书查询",
    logo: "https://crt.sh/favicon.ico",
    desc: "",
    cmds: [
        'crt查询','证书查询',
      {
        "type": "regex",
        "label": "证书查询",
        "match": "/(?=^.{4,253}$)(^((?!-)[a-zA-Z0-9-]{1,63}(?<!-)\\.)+[a-zA-Z]{2,63}\\.?$)/"
      },
    ]
  },
  components: {Container},
  data() {
    return {
      lastText: null,
      results: ''
    }
  },
  computed: {
  },
  mounted() {
  },
  methods: {
    changeApiHandler() {
      this.changeApi(this.lastText);
    },
    setValue(text) {
      this.lastText = text;
      this.changeApi();
    },
    changeApi() {
      this.results = '';
      let text = this.lastText;
      this.crtApi(text);
    },

    // https://ip.sb/api/
    async crtApi(value) {
      let res = await this.request("https://crt.sh/?q=" + value);
      let pattern = /<table>([\s\S]*?)<\/table>/ig

      let content = '';
      let index = 0;

      pattern.exec(res);
      let matches = pattern.exec(res);
      if (matches && matches.length){
        content = matches[0];
      }else{
        content = '查询失败';
      }

      this.results = content;
    },

  },
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
.CrtQuery {

}
</style>
