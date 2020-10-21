<template>
  <div class="PostMan">
    <div class="wrapper wp-json" id="pageContainer">
      <div class="panel panel-default" style="margin-bottom: 0px;">
        <div class="panel-heading">
          <h3 class="panel-title">
            <a href="#" @click="callbackReturn" style="color: red;">返回</a>
            简易postman
          </h3>
        </div>
      </div>
      <div class="panel-body" ref="panelBody" style="min-height: calc(100vh - 80px);">
        <div class="row mod-inputs">
          <div class="ui-mt-10">
            <label for="url">接口地址：</label>
            <input type="text" id="url" ref="url" v-model="urlContent" class="form-control f-url" placeholder="请输入Api地址">

            <span class="x-xdemo" @click="setDemo(1)">Get示例</span>
            <span class="x-xdemo" @click="setDemo(2)">Post示例</span>

          </div>

          <div class="ui-mt-10" v-if="methodContent === 'POST'">
            <label for="param">请求参数：</label>
            <textarea type="text" v-model="paramContent" id="param" class="form-control f-param" placeholder="请输出参数"></textarea>
          </div>

          <div class="ui-mt-10">
            <label for="method">请求方式：</label>
            <select id="method" v-model="methodContent" class="form-control f-method">
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="HEAD">HEAD</option>
            </select>
            <input class="btn btn-success" type="button" value="发送请求" @click="postman()">
          </div>
        </div>



        <div ref="resultContainer" class="row hide">
          <div id="tabs">
            <ul class="the-tabs">
              <li><a href="#tab-content">数据</a></li>
              <li><a href="#tab-json">JSON</a></li>
              <li><a href="#tab-header">响应头</a></li>
            </ul>

            <div id="tab-content" class="mod-tab">{{resultContent}}</div>

            <div class="mod-tab" id="tab-json">
              <div id="formattingMsg"><span class="x-loading"></span>格式化中...</div>
              <div id="jfCallbackName_start" class="callback-name" v-html="jfCallbackName_start"></div>
              <div id="jfContent" v-html=" errorMsgForJson || resultContent"></div>
              <pre id="jfContent_pre"></pre>
              <div id="jfCallbackName_end" class="callback-name" v-html="jfCallbackName_end"></div>
            </div>

            <div id="tab-header" class="mod-tab">
              <table class="table table-hover">
                <thead>
                <tr>
                  <th>序号</th>
                  <th>头信息</th>
                  <th>具体内容</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(h,index) in responseHeaders">
                  <td>{{index+1}}</td>
                  <td>{{h[0]}}</td>
                  <td>{{h[1]}}</td>
                </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">

  export default {
    name: "PostMan",
    data() {
      return {
        urlContent: '',
        methodContent: 'GET',
        resultContent: '',
        paramContent: '',
        responseHeaders: [],
        jfCallbackName_start: '',
        jfCallbackName_end: '',
        errorMsgForJson: ''
      }
    },
    mounted: function () {
      this.$refs.url.focus();
    },
    methods: {
      callbackReturn(){
        this.$emit("callbackReturn");
      },


      postman: function () {
        this.$nextTick(() => {
          this.sendRequest(this.urlContent, this.methodContent, this.paramContent);
        });
      },

      sendRequest: function (url, method, body) {
        let xhr = new XMLHttpRequest();
        xhr.addEventListener("readystatechange", (resp) => {
          let result = 'Loading...';
          switch (resp.target.readyState) {
            case resp.target.OPENED:
              result = 'Senting...';
              break;
            case resp.target.HEADERS_RECEIVED:
              result = 'Headers received';
              this.responseHeaders = resp.target.getAllResponseHeaders().trim().split('\n').map(item => {
                return item.split(': ').map(x => x.trim())
              });
              break;
            case resp.target.LOADING:
              result = 'Loading...';
              break;
            case resp.target.DONE:
              try {
                result = JSON.stringify(JSON.parse(resp.target.responseText), null, 4);

              } catch (e) {
                result = resp.target.responseText;
              }

              this.jsonFormat(result);
              this.renderTab();
              break;
          }
          this.resultContent = result || '无数据';
        });
        xhr.open(method, url);
        if(method.toLowerCase() === 'post') {
          xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
          xhr.send(body);
        }else{
          xhr.send();
        }
      },

      renderTab: function () {
        $('#tabs').tabs({
          show: (event, ui) => {
          }
        });
        this.$refs.resultContainer.classList.remove('hide');
      },


      jsonFormat: function (source) {
        this.errorMsgForJson = '';
        this.jfCallbackName_start = '';
        this.jfCallbackName_end = '';

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
              this.errorMsgForJson = exxx.message;
            }
          }
        }

        // 是json格式，可以进行JSON自动格式化
        if (jsonObj != null && typeof jsonObj === "object" && !this.errorMsgForJson.length) {
          try {
            // 要尽量保证格式化的东西一定是一个json，所以需要把内容进行JSON.stringify处理
            source = JSON.stringify(jsonObj);
          } catch (ex) {
            // 通过JSON反解不出来的，一定有问题
            this.errorMsgForJson = ex.message;
          }

          if (!this.errorMsgForJson.length) {
            // 格式化
            require('../json-format/format-lib').format(source);

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

        // 不是json，都格式化不了，一定会出错
        if (this.errorMsgForJson) {
          let el = document.querySelector('#optionBar');
          el && (el.style.display = 'none');
        }

      },

      setDemo: function (type) {
        if (type === 1) {
          this.urlContent = 'https://www.sojson.com/api/qqmusic/8446666/json';
          this.methodContent = 'GET';
        } else {
          this.urlContent = 'https://www.baidufe.com/test-post.php';
          this.methodContent = 'POST';
          this.paramContent = 'username=postman&password=123456'
        }

      }
    },
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .PostMan {
  }
</style>
