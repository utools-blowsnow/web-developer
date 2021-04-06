<template>
  <div class="IpQuery">
    <container title="IP查询">
      <template slot="head">
        <span style="margin: 0 10px;">IP：</span>
        <el-input size="mini" style="width: 120px;" v-model="lastText" placeholder="IP"></el-input>
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
          <el-input style="width: 150px;" type="password" size="mini" v-for="item in nowApi.set"
                    v-model="nowApi[item.value]" :placeholder="item.label"></el-input>
        </div>
      </template>
      <el-table
          :data="results"
          style="width: 100%">
        <el-table-column
            prop="name"
            label="数据"
            min-width="180">
        </el-table-column>
        <el-table-column
            prop="value"
            label="信息"
            min-width="380">
        </el-table-column>
      </el-table>
      <div id="mapContainer"></div>
    </container>
  </div>
</template>

<script type="text/ecmascript-6">
import Container from "../../components/Container";

export default {
  name: "IpQuery",
  info: {
    label: "IP查询",
    logo: "",
    desc: "",
    cmds: [
      {
        "type": "regex",
        "label": "ip查询",
        "match": "/^((2(5[0-5]|[0-4]\\d))|[0-1]?\\d{1,2})(\\.((2(5[0-5]|[0-4]\\d))|[0-1]?\\d{1,2})){3}$/"
      }
    ]
  },
  components: {Container},
  data() {
    return {
      api: "ipip",
      apiOptions: [
        {label: "ip.sb", value: "ipsb"},
        {label: "ipip", value: "ipip"},
        // {label: "淘宝IP",value: "taobao"},
        {
          label: "百度地图", value: "baidu", set: [
            {label: "百度ak", value: "key"}
          ], key: "Gwb8qTDLXEYRQeeeFoSeBBvtL4CjG0oL"
        },
        {
          label: "高德地图", value: "amap", set: [
            {label: "高德key", value: "key"}
          ], key: "158c902c6fbe986ef1cc2f9099a1aa4a"
        },
        {label: "ipapi", value: "ipapi"}
      ],
      isMap: false,

      lastText: null,
      results: [],
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
    if (window.dbs('ip_query_type')) {
      this.api = window.dbs('ip_query_type') || "ipip";
    }

    if (window.plugin_enter && window.plugin_enter.type === "text") {
      //默认获取本机外网ip
      this.localIp();
    }

  },
  methods: {
    changeApiHandler() {
      window.dbs('ip_query_type', this.api);
      this.changeApi(this.lastText);
    },
    setValue(text) {
      this.lastText = text;
      this.changeApi();
    },
    changeApi() {
      this.results = [];
      let text = this.lastText;
      eval("this." + this.api + "Api('" + text + "')");
    },


    async localIp() {
      var that = this;
      // https://api64.ipify.org/?format=json
      // http://ip.360.cn/IPShare/info
      // https://www.ip.cn/api/index?ip=&type=0
      let res = await this.request("https://www.ip.cn/api/index?ip=&type=0");
      this.setValue(res.ip);
    },

    //百度
    async baiduApi(ip) {
      // https://api.map.baidu.com/location/ip?ak=Gwb8qTDLXEYRQeeeFoSeBBvtL4CjG0oL&ip=182.85.215.46
      let res = await this.request("https://api.map.baidu.com/location/ip?ak=" + this.nowApi.key + "&ip=" + ip);
      if (res.status !== 0) {
        toast(res.message);
        return;
      }
      this.results = [
        {name: "当前IP", value: ip},
        {name: "地理位置", value: res.content.address},
        {name: "经纬度", value: res.content.point.y + "," + res.content.point.x}
      ];
    },
    //高德
    async amapApi(ip) {
      let res = await this.request("https://restapi.amap.com/v3/ip?key=" + this.nowApi.key + "&ip=" + ip);
      if (res.status !== "1") {
        toast(res.info);
        return;
      }
      this.results = [
        {name: "当前IP", value: ip},
        {name: "地理位置", value: res.province + res.city},
        {name: "经纬度", value: res.rectangle},
        {name: "编码", value: res.adcode},
      ];
    },
    //http://ip-api.com/json/182.85.215.46
    async ipapiApi(ip) {
      let res = await this.request("http://ip-api.com/json/" + ip);
      this.results = [
        {name: "当前IP", value: ip},
        {name: "地理位置", value: res.country + " " + res.regionName + " " + res.city},
        {name: "地址", value: res.as},
        {name: "时区", value: res.timezone},
        {name: "ISP", value: res.isp},
        {name: "经纬度", value: res.lon + "," + res.lat},
        {name: "编码", value: res.zip},
      ];
    },
    //http://ip.taobao.com/service/getIpInfo.php?ip=182.85.215.46
    async taobaoApi(ip) {
      let res = await this.request("http://ip.taobao.com/service/getIpInfo.php?ip=" + ip)
      this.results = [
        {name: "当前IP", value: ip},
        {name: "地理位置", value: res.data.country + " " + res.data.region + " " + res.data.city},
        {name: "ISP", value: res.data.isp},
        {name: "编码", value: res.data.region_id},
      ];
    },
    //http://freeapi.ipip.net/182.85.215.46
    async ipipApi(ip) {
      let res = await this.request("http://freeapi.ipip.net/" + ip);
      this.results = [
        {name: "当前IP", value: ip},
        {name: "地理位置", value: res[0] + " " + res[1] + " " + res[2]},
        {name: "ISP", value: res[4]}
      ];
    },
    // https://ip.sb/api/
    async ipsbApi(ip){
      // https://api.ip.sb/geoip
      let res = await this.request("https://api.ip.sb/geoip/" + ip);
      this.results = [
        {name: "国家", value: res.country},
        {name: "地区", value: res.region },
        {name: "城市", value: res.city },
        {name: "邮编", value: res.postal_code },
        {name: "纬度", value: res.latitude },
        {name: "经度", value: res.longitude },
        {name: "组织", value: res.organization }
      ];
    }
  },
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
.IpQuery {

}
</style>
