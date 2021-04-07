<template>
  <div class="icp">
    <container title="备案查询" >
      <template slot="head">
        <span style="margin: 0 10px;">域名：</span>
        <el-input size="mini" style="width: 120px;" v-model="lastText" placeholder="域名"></el-input>
        <el-button size="mini" type="primary" style="margin: 0 10px;" @click="changeApi">查询</el-button>

        <el-select @change="changeApiHandler" size="mini" style="width: 140px;margin-left: 20px;" v-model="api" placeholder="placeholder">
          <el-option
            v-for="item in apiOptions"
            :key="item.value"
            :label="'接口：'+item.label"
            :value="item.value">
          </el-option>
        </el-select>
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
          <template slot-scope="scope">
            <div v-html="scope.row.value"></div>
          </template>
        </el-table-column>
      </el-table>
      <div id="mapContainer"></div>
    </container>
  </div>
</template>

<script type="text/ecmascript-6">
  import Container from "../../components/Container";

  export default {
    name: "Icp",
    info:{
      label: "备案查询",
      logo: "",
      desc: "",
      cmds:[
        "icp","域名",
        {
          "type": "regex",
          "label": "备案查询",
          "match": "/(?=^.{4,253}$)(^((?!-)[a-zA-Z0-9-]{1,63}(?<!-)\\.)+[a-zA-Z]{2,63}\\.?$)/"
        },
      ]
    },
    components: {Container},
    data() {
      return {
        api: "chinaz",
        apiOptions: [
          {label: "chinaz",value: "chinaz"}
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
      if (window.db.get("icp_query_api")){
        this.api = window.db.get("icp_query_api");
      }
    },
    methods: {
      changeApiHandler(){
        window.db.set("icp_query_api",this.api);
        this.changeApi(this.lastText);
      },
      setValue(text){
        this.lastText = text;
        this.changeApi();
      },
      async changeApi(){
        this.results = [];
        let text = this.lastText;

        await this[this.api + 'Api'](text);

        // 其他信息查询
        // QQ域名拦截查询
        let res = await this.request("https://common.onlinfei.com/api/domainCheck/qq?url=" + text);
        this.results.push({'name': 'QQ域名拦截' , 'value': res.data.info});

        // 微信域名拦截查询
        res = await this.request("https://common.onlinfei.com/api/domainCheck/weiXin?url=" + text);
        if (res.data.status == 0){
          this.results.push({'name': '微信域名拦截' , 'value': `<a href="javascript:;" title="${res.data.data.title} - ${res.data.data.desc}">${res.data.info}</a>`});
        }else{
          this.results.push({'name': '微信域名拦截' , 'value': `${res.data.info}`});
        }
      },

      async chinazApi(domain){
        let res = await this.request("https://icp.chinaz.com/" + domain);
        let content = res;
        // <li[\s\S]*?>[\s\S]*?<span>([\s\S]*?)<\/span>[\s\S]*?<p[\s\S]*?>([\s\S]*?)<\/p>
        let pattern = /<li[\s\S]*?>[\s\S]*?<span>(主办单位名称|主办单位性质|网站备案\/许可证号|网站名称|网站首页网址|审核时间)<\/span>[\s\S]*?<p[\s\S]*?>([\s\S]*?)<\/p>/g
        this.results = [];
        while(pattern.exec(res)){
          this.results.push({'name':RegExp.$1 , 'value':RegExp.$2});
          res = RegExp.rightContext;//将str截断
          pattern.lastIndex = 0;//重置下次匹配开始的位置
        }

        pattern = /以下信息更新时间：(.*?)</
        let matches = content.match(pattern);
        if (matches && matches.length){
          this.results.push({'name': '数据更新时间' , 'value': matches[1]});
        }else{
          this.results.push({'name': '查询提示' , 'value': '域名备案信息查询失败/未备案'});
        }
      },


      //onlinfei
      async onlinfeiApi(domain){
        let res = await this.request("https://api.onlinfei.com/icp.php?domain=" + domain);
        if (res.status === 0){
          toast(res.info);
          return;
        }
        this.results = [
          { name: "域名", value: res.data.domain },
          { name: "单位名称", value: res.data.unitName },
          { name: "单位性质", value: res.data.unitProperty },
          { name: "备案号", value: res.data.icpNumber },
          { name: "网站名称", value: res.data.websiteName },
          { name: "网站首页地址", value: res.data.websiteHomePageUrl },
          { name: "审核时间", value: res.data.auditTime },
        ];
      }
    },
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .icp {

  }
</style>
