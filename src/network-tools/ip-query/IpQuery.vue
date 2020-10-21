<template>
  <div class="IpQuery">
    <container title="IP查询" >
      <template slot="head">
        <span style="margin: 0 10px;">IP：</span>
        <el-input size="mini" style="width: 120px;" v-model="lastText" placeholder="IP"></el-input>
        <el-button size="mini" type="primary" style="margin: 0 10px;" @click="changeApi">查询</el-button>

        <el-select @change="changeApiHandler" size="mini" style="width: 140px;margin-left: 20px;" v-model="api" placeholder="placeholder">
          <el-option
            v-for="item in apiOptions"
            :key="item.value"
            :label="'接口：'+item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <div v-if="nowApi.set" style="margin: 0 10px;">
          设置：
          <el-input style="width: 150px;" type="password" size="mini" v-for="item in nowApi.set" v-model="nowApi[item.value]" :placeholder="item.label"></el-input>
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
    components: {Container},
    data() {
      return {
        api: "ipip",
        apiOptions: [
          {label: "ipip",value: "ipip"},
          {label: "淘宝IP",value: "taobao"},
          {label: "百度地图",value: "baidu",set:[
              {label: "百度ak",value: "key"}
          ],key: "Gwb8qTDLXEYRQeeeFoSeBBvtL4CjG0oL"},
          {label: "高德地图",value: "amap",set:[
              {label: "高德key",value: "key"}
          ],key: "158c902c6fbe986ef1cc2f9099a1aa4a"},
          {label: "ipapi",value: "ipapi"}
        ],
        isMap: false,

        lastText: null,
        results: [],
        datas:{}
      }
    },
    computed:{
      nowApi(){
        for (let data of this.apiOptions){
          if (data.value === this.api) {
            return data;
          }
        }
        return {};
      }
    },
    mounted(){
      //this.loadScriptString("//api.map.baidu.com/api?ak=egwfleDw6rbXLXTuXtAfd3ZTG2eB7mhS&type=lite&v=1.0");
      // this.setValue('182.85.215.46');
      if (window.db.get("ip_query_api")){
        this.api = window.db.get("ip_query_api");
      }
    },
    methods: {
      loadScriptString(src) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = src;
        head.appendChild(script);
      },
      createMap(){
        var map = new BMap.Map("mapContainer");            // 创建Map实例
        var point = new BMap.Point(116.404, 39.915); // 创建点坐标
        map.centerAndZoom(point,15);
        map.enableScrollWheelZoom();                 //启用滚轮放大缩小
      },

      changeApiHandler(){
        window.db.set("ip_query_api",this.api);
        this.changeApi(this.lastText);
      },
      setValue(text){
        this.lastText = text;
        this.changeApi();
      },
      changeApi(){
        this.results = [];
        let text = this.lastText;
        switch (this.api) {
          case "baidu":
            this.baiduApi(text);
            break;
          case "amap":
            this.amapApi(text);
            break;
          case "ipapi":
            this.ipApi(text);
            break;
          case "taobao":
            this.taobaoApi(text);
            break;
          case "ipip":
            this.ipipApi(text);
            break;
        }
      },




      //百度
      baiduApi(ip){
        // https://api.map.baidu.com/location/ip?ak=Gwb8qTDLXEYRQeeeFoSeBBvtL4CjG0oL&ip=182.85.215.46
        $.get("https://api.map.baidu.com/location/ip?ak=" + this.nowApi.key + "&ip=" + ip,res=>{
          if (res.status !== 0){
            toast(res.message);
            return;
          }
          this.results = [
            { name: "当前IP", value: ip },
            { name: "地理位置", value: res.content.address },
            { name: "经纬度", value: res.content.point.y + "," + res.content.point.x }
          ];
        },"JSON")
      },
      //高德
      amapApi(ip){
        // https://restapi.amap.com/v3/ip?key=158c902c6fbe986ef1cc2f9099a1aa4a&ip=182.85.215.46
        $.get("https://restapi.amap.com/v3/ip?key=" + this.nowApi.key + "&ip=" + ip,res=>{
          if (res.status !== "1"){
            toast(res.info);
            return;
          }
          this.results = [
            { name: "当前IP", value: ip },
            { name: "地理位置", value: res.province + res.city },
            { name: "经纬度", value: res.rectangle },
            { name: "编码", value: res.adcode },
          ];
        },"JSON")
      },
      //http://ip-api.com/json/182.85.215.46
      ipApi(ip){
        $.get("http://ip-api.com/json/" + ip,res=>{
          this.results = [
            { name: "当前IP", value: ip },
            { name: "地理位置", value: res.country + " " + res.regionName + " "  + res.city },
            { name: "地址", value: res.as },
            { name: "时区", value: res.timezone },
            { name: "ISP", value: res.isp },
            { name: "经纬度", value: res.lon + "," + res.lat},
            { name: "编码", value: res.zip },
          ];
        },"JSON")
      },
      //http://ip.taobao.com/service/getIpInfo.php?ip=182.85.215.46
      taobaoApi(ip){
        $.get("http://ip.taobao.com/service/getIpInfo.php?ip=" + ip,res=>{
          this.results = [
            { name: "当前IP", value: ip },
            { name: "地理位置", value: res.data.country + " " + res.data.region + " "  + res.data.city },
            { name: "ISP", value: res.data.isp },
            { name: "编码", value: res.data.region_id },
          ];
        },"JSON")
      },
      //http://freeapi.ipip.net/182.85.215.46
      ipipApi(ip){
        $.get("http://freeapi.ipip.net/" + ip,res=>{
          this.results = [
            { name: "当前IP", value: ip },
            { name: "地理位置", value: res[0] + " " + res[1] + " "  + res[2] },
            { name: "ISP", value: res[4] }
          ];
        },"JSON")
      },
    },
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .IpQuery {

  }
</style>
