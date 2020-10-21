<template>
  <div class="JsonFormat">
    <div class="wrapper wp-json" id="pageContainer">
      <div class="panel panel-default" style="margin-bottom: 0px;">
        <div class="panel-heading">
          <h3 class="panel-title">
            <a href="#" @click="callbackReturn" style="color: red;">返回</a>
            JSON格式化查看
            <span class="x-xdemo" ref="demoLink1" @click="setDemo">示例：JSON片段</span>
            <span id="layoutBar">
              <button id="btnLeftRight" ref="btnLeftRight" class="selected" @click="changeLayout('left-right')">左右布局</button>
              <button id="btnUpDown" ref="btnUpDown" @click="changeLayout('up-down')">上下布局</button>
            </span>
          </h3>
        </div>
      </div>
      <div>
        <div class="ui-mt-10">
          <button id="btnFormat" class="btn btn-primary" @click="format">格式化</button>
          <button id="btnCompress" style="margin-left: 10px;" class="btn btn-success" @click="compress">压缩</button>
          <input type="checkbox" v-model="jsonLintSwitch" id="jsonLint" @click="lintOn"><label for="jsonLint">开启JSONLint</label>
          <input type="checkbox" v-model="overrideJson" id="jsonOvrd" @click="setCache"><label for="jsonOvrd">选中JSON并编辑</label>
          <span class="x-split" style="margin: 0 10px;">|</span>

          <span class="x-stitle">JSON排序：</span>

          <label for="sort_null" style="margin-left: 10px;">默认</label>
          <input type="radio" name="jsonsort" id="sort_null" value="0" checked @click="format">

          <label for="sort_asc" style="margin-left: 10px;">升序</label>
          <input type="radio" name="jsonsort" id="sort_asc" value="1" @click="format">

          <label for="sort_desc" style="margin-left: 10px;">降序</label>
          <input type="radio" name="jsonsort" id="sort_desc" value="-1" @click="format">

        </div>
      </div>
      <div class="panel-body mod-json" ref="panelBody">
        <div class=" panel-txt">
          <textarea class="form-control mod-textarea" v-model="json" id="jsonSource" placeholder="在这里粘贴您需要进行格式化的JSON代码" ref="jsonBox"></textarea>

          <div id="errorTips" v-bind:style="{display:showTips?'block':'none'}">
            <div id="errorBtn" @click="closeTips"><span id="closeError">☓</span></div>
            <div id="tipsBox" v-html="errorPos"></div>
            <div id="errorCode" v-html="errorJsonCode"></div>
          </div>
        </div>

        <div class=" rst-item" id="modJsonResult">
          <div id="formattingMsg"><span class="x-loading"></span>格式化中...</div>
          <div id="jfCallbackName_start" class="callback-name" v-html="jfCallbackName_start"></div>
          <div id="jfContent" v-html="resultContent"></div>
          <pre id="jfContent_pre"></pre>
          <div id="jfCallbackName_end" class="callback-name" v-html="jfCallbackName_end"></div>
        </div>
      </div>

    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  let editor = {};
  let LOCAL_KEY_OF_LAYOUT = 'local-layout-key';
  let JSON_LINT = 'jsonformat:json-lint-switch';
  let EDIT_ON_CLICK = 'jsonformat:edit-on-click';

  export default {
    name: "JsonFormat",
    data() {
      return {
        defaultResultTpl: '<div class="x-placeholder"><img src="@/tools/json-format/json-demo.jpg" alt="json-placeholder"></div>',
        resultContent: '',
        jsonFormattedSource: '',
        errorMsg: '',
        errorJsonCode: '',
        errorPos: '',
        jfCallbackName_start: '',
        jfCallbackName_end: '',
        showTips: false,
        jsonLintSwitch: true,
        fireChange: true,
        overrideJson: false,

        json:  null
      }
    },
    mounted: function () {
      this.resultContent = this.defaultResultTpl;

      this.jsonLintSwitch = (localStorage.getItem(JSON_LINT) !== 'false');
      this.overrideJson = (localStorage.getItem(EDIT_ON_CLICK) === 'true');
      this.changeLayout(localStorage.getItem(LOCAL_KEY_OF_LAYOUT));

      editor = CodeMirror.fromTextArea(this.$refs.jsonBox, {
        mode: "text/javascript",
        lineNumbers: true,
        matchBrackets: true,
        styleActiveLine: true,
        lineWrapping: true
      });

      //输入框聚焦
      editor.focus();

      // 格式化以后的JSON，点击以后可以重置原内容
      window._OnJsonItemClickByFH = (jsonTxt) => {
        if (this.overrideJson) {
          this.disableEditorChange(jsonTxt);
        }
      };
      editor.on('change', (editor, changes) => {
        this.jsonFormattedSource = editor.getValue().replace(/\n/gm, ' ');
        this.fireChange && this.format();
      });


    },
    methods: {
      callbackReturn(){
        this.$emit("callbackReturn");
      },
      setValue(value){
        editor.setValue(value);
      },
      format: function () {
        this.showTips = false;
        this.errorMsg = '';
        this.resultContent = this.defaultResultTpl;

        let source = editor.getValue().replace(/\n/gm, ' ');
        if (!source) {
          return false;
        }

        // JSONP形式下的callback name
        let funcName = null;
        // json对象
        let jsonObj = null;

        // 下面校验给定字符串是否为一个合法的json
        try {
          // 再看看是不是jsonp的格式
          let reg = /^([\w\.]+)\(\s*([\s\S]*)\s*\)$/igm;
          let matches = reg.exec(source);
          if (matches != null) {
            funcName = matches[1];
            source = matches[2];
          }
          // 这里可能会throw exception
          jsonObj = JSON.parse(source);
        } catch (ex) {
          // new Function的方式，能自动给key补全双引号，但是不支持bigint，所以是下下策，放在try-catch里搞
          try {
            jsonObj = new Function("return " + source)();
          } catch (exx) {
            try {
              // 再给你一次机会，是不是下面这种情况：  "{\"ret\":\"0\", \"msg\":\"ok\"}"
              jsonObj = new Function("return '" + source + "'")();
              if (typeof jsonObj === 'string') {
                // 最后给你一次机会，是个字符串，老夫给你再转一次
                jsonObj = new Function("return " + jsonObj)();
              }
            } catch (exxx) {
              this.errorMsg = exxx.message;
            }
          }
        }

        // 是json格式，可以进行JSON自动格式化
        if (jsonObj != null && typeof jsonObj === "object" && !this.errorMsg.length) {
          try {
            let sortType = document.querySelectorAll('[name=jsonsort]:checked')[0].value;
            if (sortType !== '0') {
              jsonObj = require('./jsonabc').sortObj(jsonObj, parseInt(sortType), true);
            }
            source = JSON.stringify(jsonObj);
          } catch (ex) {
            // 通过JSON反解不出来的，一定有问题
            this.errorMsg = ex.message;
          }

          if (!this.errorMsg.length) {
            // 格式化
            require('./format-lib').format(source);
            this.jsonFormattedSource = source;

            // 如果是JSONP格式的，需要把方法名也显示出来
            if (funcName != null) {
              this.jfCallbackName_start = funcName + '(';
              this.jfCallbackName_end = ')';
            } else {
              this.jfCallbackName_start = '';
              this.jfCallbackName_end = '';
            }
          }
        }

        if (this.errorMsg.length) {
          if (this.jsonLintSwitch) {
            return this.lintOn();
          } else {
            this.resultContent = '<span class="x-error">' + this.errorMsg + '</span>';
            return false;
          }
        }

        return true;
      },

      compress: function () {
        if (this.format()) {
          let jsonTxt = this.jfCallbackName_start + this.jsonFormattedSource + this.jfCallbackName_end;
          this.disableEditorChange(jsonTxt);
        }
      },

      changeLayout: function (type) {
        if (type === 'up-down') {
          if (this.$refs.btnUpDown.classList.contains('selected')) {
            return;
          }
          this.$refs.panelBody.classList.add('layout-up-down');
          this.$refs.btnLeftRight.classList.remove('selected');
          this.$refs.btnUpDown.classList.add('selected');
        } else {
          if (this.$refs.btnLeftRight.classList.contains('selected')) {
            return;
          }
          this.$refs.panelBody.classList.remove('layout-up-down');
          this.$refs.btnLeftRight.classList.add('selected');
          this.$refs.btnUpDown.classList.remove('selected');
        }
        localStorage.setItem(LOCAL_KEY_OF_LAYOUT, type);
      },

      setCache: function () {
        setTimeout(()=>{
          localStorage.setItem(EDIT_ON_CLICK, this.overrideJson);
        },100);
      },

      lintOn: function () {
        setTimeout(()=>{
          localStorage.setItem(JSON_LINT, this.jsonLintSwitch);
        },100);
        if (!editor.getValue().trim()) {
          return true;
        }
        this.$nextTick(() => {
          if (!this.jsonLintSwitch) {
            return;
          }
          let lintResult = require('./jsonlint')(editor.getValue());
          if (!isNaN(lintResult.line)) {
            this.errorPos = '错误位置：' + (lintResult.line + 1) + '行，' + (lintResult.col + 1) + '列；缺少字符或字符不正确';
            this.errorJsonCode = lintResult.dom;
            this.showTips = true;
            this.$nextTick(() => {
              let el = document.querySelector('#errorCode .errorEm');
              el && el.scrollIntoView();
              let scrollEl = document.querySelector('#errorTips');
              scrollEl.scrollBy(0, el.offsetTop - scrollEl.scrollTop - 50);
            });
          }
        });
        return false;
      },

      closeTips: function () {
        this.showTips = false;
      },

      disableEditorChange: function (jsonTxt) {
        this.fireChange = false;
        this.$nextTick(() => {
          editor.setValue(jsonTxt);
          this.$nextTick(() => {
            this.fireChange = true;
          })
        })
      },

      setDemo: function () {
        let demo = '{"BigIntSupported":995815895020119788889,"date":"20180322","message":"Success !","status":200,"city":"北京","count":632,"data":{"shidu":"34%","pm25":73,"pm10":91,"quality":"良","wendu":"5","ganmao":"极少数敏感人群应减少户外活动","yesterday":{"date":"21日星期三","sunrise":"06:19","high":"高温 11.0℃","low":"低温 1.0℃","sunset":"18:26","aqi":85,"fx":"南风","fl":"<3级","type":"多云","notice":"阴晴之间，谨防紫外线侵扰"},"forecast":[{"date":"22日星期四","sunrise":"06:17","high":"高温 17.0℃","low":"低温 1.0℃","sunset":"18:27","aqi":98,"fx":"西南风","fl":"<3级","type":"晴","notice":"愿你拥有比阳光明媚的心情"},{"date":"23日星期五","sunrise":"06:16","high":"高温 18.0℃","low":"低温 5.0℃","sunset":"18:28","aqi":118,"fx":"无持续风向","fl":"<3级","type":"多云","notice":"阴晴之间，谨防紫外线侵扰"},{"date":"24日星期六","sunrise":"06:14","high":"高温 21.0℃","low":"低温 7.0℃","sunset":"18:29","aqi":52,"fx":"西南风","fl":"<3级","type":"晴","notice":"愿你拥有比阳光明媚的心情"},{"date":"25日星期日","sunrise":"06:13","high":"高温 22.0℃","low":"低温 7.0℃","sunset":"18:30","aqi":71,"fx":"西南风","fl":"<3级","type":"晴","notice":"愿你拥有比阳光明媚的心情"},{"date":"26日星期一","sunrise":"06:11","high":"高温 21.0℃","low":"低温 8.0℃","sunset":"18:31","aqi":97,"fx":"西南风","fl":"<3级","type":"多云","notice":"阴晴之间，谨防紫外线侵扰"}]}}';
        editor.setValue(demo);
      }
    }
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "index.css"
.JsonFormat {

}
</style>
