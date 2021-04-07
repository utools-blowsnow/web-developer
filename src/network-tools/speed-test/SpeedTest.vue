<template>
  <div class="SpeedTest">
    <container title="网络测速" >
      <template slot="head">

      </template>
      <iframe src="https://plugin.speedtest.cn/" frameborder="0" style="width: 100%; height: calc(100vh - 80px);"></iframe>
    </container>
  </div>
</template>

<script type="text/ecmascript-6">
  import Container from "../../components/Container";
  export default {
    name: "SpeedTest",
    info:{
      label: "网络测速",
      logo: "https://www.speedtest.cn/images/ico/favicon.ico",
      desc: "",
      cmds:[
        "speedtest",
        "网络测速"
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

    },
    mounted(){
      this.startSpeedTest();
    },
    methods: {
      setValue() {
        this.startSpeedTest();
      },
      startSpeedTest(){
        setTimeout(function (){
          var frame = window.frames[0].contentWindow;
          var e = frame.document.createEvent("MouseEvents");
          e.initEvent("click", true, true);
          frame.document.getElementById("开始测速").dispatchEvent(e);
        },300)
      }
    },
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
  .SpeedTest {

  }
</style>
