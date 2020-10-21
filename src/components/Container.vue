<template>
  <div class="my-container">
    <div class="wrapper wp-json" id="pageContainer">
      <div class="panel panel-default" style="margin-bottom: 0px;">
        <div class="panel-heading" style="display: flex;align-items: center;flex-wrap: wrap;">
          <h3 class="panel-title">
            <a href="#" @click="callbackReturn" style="color: red;">返回</a>
            {{title}}
          </h3>
          <slot name="head"></slot>
        </div>
      </div>
      <slot name="top"></slot>
      <div class="panel-body" ref="panelBody" style="min-height: calc(100vh - 80px);">
        <slot></slot>
      </div>
      <slot name="foot"></slot>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {
    name: "Container",
    props:{
      title: String
    },
    methods: {
      callbackReturn(){
        this.$parent.$parent.callbackReturn();
      },
    },
  }
</script>

<style lang="stylus" rel="stylesheet/stylus">
.my-container {
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
