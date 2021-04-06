import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import request from "@/lib/request";

Vue.use(ElementUI);
Vue.config.productionTip = false
Vue.prototype.request = request;

new Vue({
  render: function (h) { return h(App) },
}).$mount('#app')
