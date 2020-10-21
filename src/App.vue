<template>
  <div id="app">
    <template v-if="code === ''">
      <div class="row item-list">
        <div v-for="(item,index) in items" :key="index" class="col-md-3 col-xs-4 item-container" @click="openTools(item)">
          <div class="item">
            <div class="logo-box">
              <img :src="item.logo||'https://static.easyicon.net/preview/125/1256386.gif'" width="48" height="48" alt="coderunner">
            </div>
            <div class="info-box">
              <h3>{{ item.label }}</h3>
              <span>{{ item.desc||'未配置介绍' }}</span>
            </div>
            <div class="clearfix"></div>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <component  :is="code" ref="node" @callbackReturn="callbackReturn"></component>
    </template>
  </div>
</template>

<script>
// 利用require.context自动引用
const modules = require('@/lib/tools').default;
const items = [];
for(let key of Object.keys(modules)){
  let module = modules[key];
  items.push({...module.info, code: key})
}
// 动态设置
console.log(items);
export default {
  name: 'app',
  data() {
    return {
      code: '',
      payload: null,

      items: items,
      modules:{},
    }
  },
  components: modules,
  created() {
    utools.onPluginEnter(({code, type, payload}) => {
      console.log(code, type, payload);
      if (code === "open") return;
      this.code = code;

      // utools.setSubInput(({text}) => {
      //   this.$refs.node.setValue(text,type);
      // }, '输入');
      if (type === "text") return;
      // utools.setSubInputValue(payload);

      this.payload = payload;
      this.$nextTick(() => {
        let type = null;
        if (code === "code_format") {
          if (payload.match(/html|div/i)) {
            type = "HTML";
          } else if (payload.match(/var|let|function|document|window/i)) {
            type = "Javascript";
          } else if (payload.match(/\.[\s\S]*{[\s\S]*}/i)) {
            type = "CSS";
          } else if (payload.match(/<\?xml/i)) {
            type = "XML";
          } else if (payload.match(/select|update|delete|replcace\s*into|create\s*table/i)) {
            type = "SQL";
          }
        }

        this.$refs.node.setValue(payload, type);


      })
    })

  },
  methods: {
    callbackReturn() {
      this.code = '';
    },
    openTools(item) {
      this.code = item.code;
      utools.setSubInput(({text}) => {
        this.$refs.node.setValue(text);
      }, '输入');
    }
  },
}
</script>

<style lang="stylus">
.tools {
  list-style: none;
  margin: 0;
  padding: 100px 80px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.item-list{
  padding: 20px;
}
.item-list .item{
  padding: 10px;
  margin: 0 13px 13px 0;
  border: 1px solid #ccc;
  background-image: -webkit-linear-gradient(top,#fff,#f9f9f9);
  position: static;
  border-radius: 5px;
  transition: box-shadow .3s ease-in-out;
  cursor: pointer;
}
.item-list .item:hover{
  box-shadow: 0 3px 8px 0 rgba(0,0,0,.2);

}

.item-list .item .logo-box{
  float: left;
}
.item-list .item .info-box{
  float: left;
  padding: 0 10px;
}
.item-list .item .info-box h3{
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  line-height: 1.4;
  margin-bottom: 5px;
  height: 22px;
  overflow: hidden;
}
</style>
