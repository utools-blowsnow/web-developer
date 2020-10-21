<template>
  <div class="WordSplit">
    <div class="wrapper wp-json" id="pageContainer">
      <div class="panel panel-default" style="margin-bottom: 0px;">
        <div class="panel-heading" style="display: flex;align-items: center;">
          <h3 class="panel-title">
            <a href="#" @click="callbackReturn" style="color: red;">返回</a>
            分词
          </h3>
          <el-select @change="changeApi" size="mini" style="width: 140px;margin-left: 20px;" v-model="api" placeholder="placeholder">
            <el-option
              v-for="item in apiOptions"
              :key="item.value"
              :label="'接口：'+item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </div>
      </div>
      <div class="operate">
        <el-checkbox size="mini" v-model="space">添加空格</el-checkbox>
        <el-button size="mini" @click="copy">复制</el-button>
        <el-button size="mini" @click="translate">翻译</el-button>
        <el-button size="mini" @click="search">百度</el-button>
      </div>
      <div class="panel-body" ref="panelBody" style="height: calc(100vh - 80px);">
        <draggable v-model="results">
          <div v-for="(item,index) in results" :key="index"
            class="item" :class="{'active': item.checked}" @click="item.checked = !item.checked">
            <small>{{item.speech}}</small>
            <p style="margin: 0;">{{item.word}}</p>
          </div>
        </draggable>

      </div>
    </div>

  </div>
</template>

<script type="text/ecmascript-6">
  import draggable from 'vuedraggable'
  export default {
    name: "WordSplit",
    data() {
      return {
        results: [],
        api: "sogou",
        apiOptions: [
          {label: "搜狗",value: "sogou"},
          {label: "jsonin",value: "jsonin"},
          {label: "pullword",value: "pullword"},
        ],

        lastText: null,
        space: false
      }
    },
    components: {
      draggable,
    },
    mounted(){
      if (window.db.get("word_split_api")){
        this.api = window.db.get("word_split_api");
      }

      if (window.db.get("word_split_toast") != 1){
        toast('支持拖拽移动位置！');
        window.db.set("word_split_toast",1);
      }
    },
    methods: {
      changeApi(){
        window.db.set("word_split_api",this.api);
        this.split(this.lastText);
      },
      callbackReturn(){
        this.$emit("callbackReturn");
      },
      setValue(text){
        this.split(text);
      },
      split(text) {
        //http://www.sogou.com/labs/webservice/sogou_word_seg.php
        //
        this.lastText = text;
        // text = encodeURI(text);
        switch (this.api) {
          case "sogou":
            this.sogouApi(text);
            break;
          case "pullword":
            this.pullwordApi(text);
            break;
          case "jsonin":
            this.jsoninApi(text);
            break;
        }
      },
      pullwordApi(text){
        $.get("http://api.pullword.com/get.php?source="+text+"&param1=0&param2=1&json=1",res=>{
          this.results = [];
          res.forEach(data=>{
            this.results.push({
              word: data.t,
              speech: null,
              checked: false
            })
          })
        },"JSON")
      },
      sogouApi(text){
        $.post("http://www.sogou.com/labs/webservice/sogou_word_seg.php",{
          q: text,
          fmt: "js"
        },res=>{
          this.results = [];
          res.result.forEach(data=>{
            this.results.push({
              word: data[0],
              speech: data[1],
              checked: false
            })
          })
        },"JSON")
      },
      jsoninApi(text){
        $.post("https://jsonin.com/fenci.php?msg="+text+"&type=cixing",res=>{
          this.results = [];
          res.forEach(data=>{
            this.results.push({
              word: data.word,
              speech: data.tag,
              checked: false
            })
          })
        },"JSON")
      },
      copy(){
        let text = this.getSelectText();
        window.copy(text);
      },
      translate(){
        let text = this.getSelectText();
        utools.redirect('翻译', {
          'type': 'text',
          'data': text
        })
      },
      search(){
        let text = this.getSelectText();
        let url = "https://www.baidu.com/#wd=" + encodeURI(text);
        console.log(url);
        window.utils.openDefaultBrowser(url);
      },
      getSelectText(){
        let text = "";
        this.results.forEach(data=>{
          if (data.checked){
            if (this.space){
              text += data.word + " ";
            } else{
              text += data.word;
            }

          }
        })
        return text;
      },
    },
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .WordSplit {
    .operate{
      position: absolute;
      top: 30px;
      right: 40px;
    }
    .panel-body{
      padding-top: 40px;
      text-align: center;
      .item{
        display: inline-block;
        padding: 10px 20px;
        margin: 5px;
        background: #fff;
        border: 1px solid #d8d4d4;
        border-radius: 5px;
        cursor: pointer;
      }
      .item.active{
        background: #03A9F4;
        color: #fff;
      }
    }

  }
</style>
