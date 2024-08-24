<template>
  <img alt="Vue logo" src="./assets/logo.png"  @click="goToUrl"
    class="logo" />
  <HelloWorld msg="由 panz-cli 创建的 Vue.js App" />
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue"

export default {
  name: "App",
  components: {
    HelloWorld,
  },
  methods: {
  goToUrl() {
    window.location.href = 'https://coderpanz.github.io/'; // 替换为你想跳转的 URL
  }
}
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
.logo {
  padding: 20px;
  border-radius: 100%;
  background-image: linear-gradient(135deg, #81fbb8 10%, #28c76f 100%);
  transition: transform 0.3s ease; /* 添加动画过渡 */
}
.logo:hover {
  transform: scale(1.2); /* 鼠标悬停时放大图片 */
  cursor: pointer;
}
</style>
