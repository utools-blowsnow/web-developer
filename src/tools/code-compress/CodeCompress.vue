<template>
  <div class="CodeFormat">
    <div class="wrapper wp-json" id="pageContainer">
      <div class="panel panel-default" style="margin-bottom: 0px;">
        <div class="panel-heading">
          <h3 class="panel-title">
              <a href="#" @click="callbackReturn" style="color: red;">返回</a>
              代码压缩
          </h3>
        </div>
      </div>
      <div class="panel-body mod-code" style="display: flex;flex-direction: column;height: calc(100vh - 80px);">

        <div class="row" style="overflow: auto;flex: 1;">
          <textarea class="form-control mod-textarea" id="codeSource" ref="codeSource" v-model="sourceContent" placeholder="在这里粘贴需要进行压缩的代码"></textarea>
        </div>
        <div class="row ui-mt-10">
          <div class="radio ui-d-ib">
            <label><input id="codeTypeJs" name="codeType" type="radio" value="Javascript" v-model="selectedType">JS代码</label>
          </div>

          <div class="radio ui-d-ib ui-ml-10">
            <label><input id="codeTypeCss" name="codeType" type="radio" value="CSS" disabled v-model="selectedType">CSS代码</label>
          </div>

          <div class="radio ui-d-ib ui-ml-10">
            <label><input id="codeTypeHTML" name="codeType" type="radio" value="HTML" disabled v-model="selectedType">HTML代码</label>
          </div>

          <div class="radio ui-d-ib ui-ml-10">
            <label><input id="codeTypeXML" name="codeType" type="radio" value="XML" disabled v-model="selectedType">XML代码</label>
          </div>

          <div class="radio ui-d-ib ui-ml-10">
            <label><input id="codeTypeSQL" name="codeType" type="radio" value="SQL" disabled v-model="selectedType">SQL代码</label>
          </div>

          <button id="btnFormat" class="btn btn-success ui-fl-r" @click="compress()">压缩</button>
          <button id="btnCopy" class="btn btn-warning ui-fl-r ui-mr-10" @click="copy" v-show="showCopyBtn">复制结果</button>
        </div>

        <div class="row rst-item" style="overflow: auto;flex: 1;">
          <textarea style="height: 100%;margin-bottom: 0;" class="form-control mod-textarea" id="jfContent" ref="jfContent" placeholder="压缩后的代码将在这里显示"
                    v-model="resultContent" @mouseover="getResult()"></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  let editor = {};
  export default {
    name: "CodeCompress",
    data() {
      return {
        selectedType: 'Javascript',

        sourceContent: '',
        resultContent: '',

        showCopyBtn: false
      }
    },
    mounted: function () {

      editor = CodeMirror.fromTextArea(this.$refs.codeSource, {
        mode: "text/javascript",
        lineNumbers: true,
        matchBrackets: true,
        styleActiveLine: true,
        lineWrapping: true
      });

      //输入框聚焦
      editor.focus();
    },
    methods: {
      callbackReturn(){
        this.$emit("callbackReturn");
      },
      setValue(value){
        this.sourceContent = value;
      },
      compress: function () {

        this.sourceContent = editor.getValue().trim();

        if (!this.sourceContent) {
          alert('请先粘贴您需要压缩的代码');
        } else {
          // 用uglifyjs3进行在线压缩
          let UglifyJs3 = require('./uglifyjs3');
          let result = UglifyJs3.compress(this.sourceContent);
          this.resultContent = result.out || result.error;
          this.$refs.jfContent.style.color = result.error ? 'red' : 'black';

          this.showCopyBtn = true;
        }
      },

      getResult: function () {
        this.$refs.jfContent.select();
      },


      copy: function(){
        let txt = this.resultContent;
        window.copy(txt);
      }
    },
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "index.css"
  .CodeFormat {

  }
</style>
