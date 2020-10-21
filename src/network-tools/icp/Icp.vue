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
        {
          "type": "regex",
          "label": "备案查询",
          "match": "/(?=^.{4,253}$)(^((?!-)[a-zA-Z0-9-]{1,63}(?<!-)\\.)+[a-zA-Z]{2,63}\\.?$)/"
        }
      ]
    },
    components: {Container},
    data() {
      return {
        api: "onlinfei",
        apiOptions: [
          {label: "onlinfei",value: "onlinfei"}
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
      changeApi(){
        this.results = [];
        let text = this.lastText;
        switch (this.api) {
          case "onlinfei":
            this.onlinfeiApi(text);
            break;
        }
      },




      //onlinfei
      onlinfeiApi(domain){
        // https://api.map.baidu.com/location/ip?ak=Gwb8qTDLXEYRQeeeFoSeBBvtL4CjG0oL&ip=182.85.215.46
        $.get("https://api.onlinfei.com/icp.php?domain=" + domain,res=>{
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
        },"JSON")
      }
    },
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .icp {

  }
</style>
