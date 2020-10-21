<template>
  <div class="CodeFormat">
    <div class="wrapper wp-json" id="pageContainer">
      <div class="panel panel-default" style="margin-bottom: 0px;">
        <div class="panel-heading">
          <h3 class="panel-title">
            <a href="#" @click="callbackReturn" style="color: red;">返回</a>
            代码美化
          </h3>
        </div>
      </div>
      <div class="panel-body" ref="panelBody" style="display: flex;flex-direction: column;height: calc(100vh - 80px);">
        <div class="row" style="flex: 1;overflow: auto;">
          <textarea class="form-control mod-textarea" id="codeSource" ref="codeSource" style="height: 100%;"
                    placeholder="在这里粘贴需要进行美化的代码" v-model="sourceContent"></textarea>
        </div>
        <div class="row ui-mt-10">

          <div class="radio ui-d-ib">
            <label><input id="codeTypeJs" name="codeType" type="radio" value="Javascript" v-model="selectedType">JS代码</label>
          </div>

          <div class="radio ui-d-ib ui-ml-10">
            <label><input id="codeTypeCss" name="codeType" type="radio" value="CSS" v-model="selectedType">CSS代码</label>
          </div>

          <div class="radio ui-d-ib ui-ml-10">
            <label><input id="codeTypeHTML" name="codeType" type="radio" value="HTML" v-model="selectedType">HTML代码</label>
          </div>

          <div class="radio ui-d-ib ui-ml-10">
            <label><input id="codeTypeXML" name="codeType" type="radio" value="XML" v-model="selectedType">XML代码</label>
          </div>

          <div class="radio ui-d-ib ui-ml-10">
            <label><input id="codeTypeSQL" name="codeType" type="radio" value="SQL" v-model="selectedType">SQL代码</label>
          </div>

          <button id="btnFormat" class="btn btn-success ui-fl-r" @click="format">格式化</button>
          <button id="btnCopy" class="btn btn-warning ui-fl-r ui-mr-10" @click="copy" v-show="showCopyBtn">复制结果</button>
        </div>
        <div style="flex: 1;" class="row" id="jfContent" ref="jfContentBox" v-html="resultContent"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {
    name: "CodeFormat",
    info:{
      label: "代码美化",
      logo: "https://static.easyicon.net/preview/126/1266712.gif",
      desc: "",
    },
    data() {
      return {
        selectedType: 'Javascript',
        sourceContent: '',
        resultContent: '',
        showCopyBtn: false,

      }
    },
    methods: {
      callbackReturn(){
        this.$emit("callbackReturn");
      },
      setValue(value,type){
        this.selectedType = type;
        this.sourceContent = value;
        this.format();
      },
      format: function () {
        if(!this.sourceContent.trim()) {
          return alert('内容为空，不需要美化处理！');
        }
        this.code =  'format';
        let beauty = (result) => {
          result = result.replace(/>/g, '&gt;').replace(/</g, '&lt;');
          result = '<pre class="language-' + this.selectedType.toLowerCase() + ' line-numbers"><code>' + result + '</code></pre>';
          this.resultContent = result;

          // 代码高亮
          this.$nextTick(() => {
            Prism.highlightAll();
            this.showCopyBtn = true;
          });
        };

        switch (this.selectedType) {
          case 'Javascript':
            let opts = {
              brace_style: "collapse",
              break_chained_methods: false,
              indent_char: " ",
              indent_scripts: "keep",
              indent_size: "4",
              keep_array_indentation: true,
              preserve_newlines: true,
              space_after_anon_function: true,
              space_before_conditional: true,
              unescape_strings: false,
              wrap_line_length: "120",
              "max_preserve_newlines": "5",
              "jslint_happy": false,
              "end_with_newline": false,
              "indent_inner_html": false,
              "comma_first": false,
              "e4x": false
            };
            beauty(require('./beautify').js_beautify(this.sourceContent, opts));
            break;
          case 'CSS':
            require('./beautify-css').css_beautify(this.sourceContent, {}, result => beauty(result));
            break;
          case 'HTML':
            require('./beautify-html');
            beauty(html_beautify(this.sourceContent));
            break;
          case 'SQL':
            require('./vkbeautify');
            beauty(vkbeautify.sql(this.sourceContent, 4));
            break;
          default:
            require('./vkbeautify');
            beauty(vkbeautify.xml(this.sourceContent));
        }

      },

      copy: function(){
        let txt = this.$refs.jfContentBox.textContent;
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
