<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <HelloWorld msg="由 panz-cli 创建的 Vue.js App" />
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue"

export default {
  name: "App",
  components: {
    HelloWorld,
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 150px;
}
img {
  padding: 20px;
  border-radius: 100%;
  background-image: linear-gradient(135deg, #81fbb8 10%, #28c76f 100%);
}
</style>
