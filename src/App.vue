<template>
  <div id="app">
    <router-view />
    <Progress />
  </div>
</template>

<script>
import Progress from "./components/progress/index.vue"
export default {
  name: 'App',
  components:{
    Progress
  }
}
</script>


