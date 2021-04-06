<template>
  <div class="WhoisQuery">
    <container title="Whois查询">
      <template slot="head">
        <span style="margin: 0 10px;">Search：</span>
        <el-input size="mini" style="width: 120px;" v-model="lastText"
                  placeholder="IP/域名"></el-input>
        <el-button size="mini" type="primary" style="margin: 0 10px;" @click="changeApi">查询
        </el-button>

        <el-select @change="changeApiHandler" size="mini" style="width: 140px;margin-left: 20px;"
                   v-model="api" placeholder="placeholder">
          <el-option
              v-for="item in apiOptions"
              :key="item.value"
              :label="'接口：'+item.label"
              :value="item.value">
          </el-option>
        </el-select>
        <div v-if="nowApi.set" style="margin: 0 10px;">
          设置：
          <el-input style="width: 150px;" type="password" size="mini"
                    v-for="item in nowApi.set"
                    v-model="nowApi[item.value]" :placeholder="item.label"></el-input>
        </div>
        <el-button size="mini" @click="translate">翻译</el-button>
      </template>
      <pre v-html="results" style="text-align: left;"></pre>
      <div id="mapContainer"></div>
    </container>
  </div>
</template>

<script type="text/ecmascript-6">
import Container from "../../components/Container";

export default {
  name: "WhoisQuery",
  info: {
    label: "whois查询",
    logo: "",
    desc: "",
    cmds: [
      {
        "type": "regex",
        "label": "whois查询",
        "match": "/^((2(5[0-5]|[0-4]\\d))|[0-1]?\\d{1,2})(\\.((2(5[0-5]|[0-4]\\d))|[0-1]?\\d{1,2})){3}$/"
      },
      {
        "type": "regex",
        "label": "whois查询",
        "match": "/(?=^.{4,253}$)(^((?!-)[a-zA-Z0-9-]{1,63}(?<!-)\\.)+[a-zA-Z]{2,63}\\.?$)/"
      },
    ]
  },
  components: {Container},
  data() {
    return {
      api: "whois",
      apiOptions: [
        {label: "whois", value: "whois"},
        {label: "devopsclub", value: "devopsclub"},
      ],

      lastText: null,
      results: '',
      datas: {}
    }
  },
  computed: {
    nowApi() {
      for (let data of this.apiOptions) {
        if (data.value === this.api) {
          return data;
        }
      }
      return {};
    }
  },
  mounted() {
    if (window.dbs('whois_query_type')) {
      this.api = window.dbs('whois_query_type') || this.api;
    }

    if (window.plugin_enter && window.plugin_enter.type === "text") {
      //默认获取本机外网ip
      this.localIp();
    }

  },
  methods: {
    translate() {
      let text = this.results;
      utools.redirect('翻译', {
        'type': 'text',
        'data': text
      })
    },

    changeApiHandler() {
      window.dbs('whois_query_type', this.api);
      this.changeApi(this.lastText);
    },
    setValue(text) {
      this.lastText = text;
      this.changeApi();
    },
    changeApi() {
      this.results = '';
      let text = this.lastText;
      this[this.api + 'Api'](text);
      // eval("this." + this.api + "Api('" + text + "')");
    },


    async localIp() {
      var that = this;
      // https://api64.ipify.org/?format=json
      // http://ip.360.cn/IPShare/info
      // https://www.ip.cn/api/index?ip=&type=0
      let res = await this.request("https://www.ip.cn/api/index?ip=&type=0");
      this.setValue(res.ip);
    },

    // https://ip.sb/api/
    async whoisApi(value) {
      // https://api.ip.sb/geoip
      this.result('https://www.whois.com/whois/refresh.php?domain=' + value)
      let res = await this.request("https://www.whois.com/whois/" + value);
      let pattern = /<pre[\s\S]*?>([\s\S]*?)<\/pre>/
      let matches = res.match(pattern);
      let content = matches[1];
      content = content.replace(/src="(.*?)"/g, "src=\"https://www.whois.com/$1\"");
      this.results = content;
    },


    async devopsclubApi(value) {
      // https://api.ip.sb/geoip
      let res = await this.request("https://api.devopsclub.cn/api/whoisquery?domain=" + value + "&type=text");
      let content = res.data.data;
      this.results = content;
    },

  },
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
.IpQuery {

}
</style>
