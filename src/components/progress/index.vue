<template>
        <!-- 进度弹出框 -->
        <div class="progress" v-if="progressShow">
            <el-progress :percentage="percentage"></el-progress>
        </div>
</template>
<script>
import {mapGetters} from 'vuex'
export default {
    name: 'Progress',
    computed: {
    ...mapGetters(['percentage','progressShow'])  
    }
}
</script>
<style lang="scss" scoped>
  .progress {
  position: fixed;
  z-index: 100001;
  bottom: 10px;
  right: 20px;
  width: 600px;
  background: white;
  padding: 10px;
  box-sizing: border-box;
  box-shadow: 0 0 0 5px #eee;
}
</style>