<template>
    <div class="app-container containers">
        <!-- 通行人员统计 -->
        <el-row>
            <el-col :span="24">
                <CurrentChart/>
            </el-col>
        </el-row>
        <!-- 通行日志 -->
        <el-row>
            <el-col :span="24">
                <JournalChart />
            </el-col>
        </el-row>
        <!-- 设备情况分析 -->
        <el-row>
            <el-col :span="24">
                <EquipmentAnalysis />
            </el-col>
        </el-row> 
    </div>
</template>
<script>
import EquipmentAnalysis from './module/EquipmentAnalysis.vue'
import JournalChart from './module/JournalChart.vue'
import CurrentChart from './module/CurrentChart.vue'
export default {
    mounted () {
      console.log(window.location.protocol);  
    },
    components: {
        // 通行人员统计组件
        EquipmentAnalysis,
        // 通行日志组件
        JournalChart,
        // 设备情况分析组件
        CurrentChart
    }
}
</script>
<style lang="scss" scoped>
.containers {
    background-color: rgb(247, 247, 247);
}
/deep/.el-card__header {
    border: none;
}
.el-row {
    margin-bottom: 20px;
}
</style>