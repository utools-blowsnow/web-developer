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
    window.plugin_enter = false;
    utools.onPluginReady(() => {
      for(let item of items){
        if (item.cmds === undefined) item.cmds = [];
        let feature = {
          "code": item.code,
          "explain": item.label,
          "icon": item.logo||'',
          "cmds": [item.label,...item.cmds]
        };
        utools.setFeature(feature)
      }
    })
    utools.onPluginEnter((params) => {
      window.plugin_enter = params;
      const {code, type, payload} = params;
      console.log(params);
      if (code === "open") return;
      this.code = code;

      if (type === "text") return;

      // 匹配的才进  regex

      this.payload = payload;
      this.$nextTick(() => {
        let type = null;
        this.$refs.node.setValue(payload, type);
      })
    })

  },
  methods: {
    callbackReturn() {
      this.code = '';
      window.plugin_enter = false;
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
