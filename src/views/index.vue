<template>
  <div class="dashboard-editor-container">
    <panel-group />

    <el-row
      style="
        background: #fff;
        padding: 16px;
        border: 1px soled gray;
      "
    >
      <!-- <line-chart :chart-data="lineChartData" /> -->
      <h5>版本信息</h5>
      <el-collapse accordion v-model="activeName">
        <el-collapse-item v-for="version in this.versions" :key="version.title" :name="version.title">
          <template slot="title">
            <div style="width:100%;">
              <span style="font-size:15px;font-weight:bold;">{{version.title}}</span><span style="float:right;color:#BA282A;padding-right:1%;">{{version.releaseDate}}</span>
            </div>
          </template>
          <div v-html="version.description"></div>
        </el-collapse-item>
      </el-collapse>
    </el-row>

    <!-- <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <raddar-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <pie-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <bar-chart />
        </div>
      </el-col>
    </el-row> -->
  </div>
</template>

<script>
import PanelGroup from './dashboard/PanelGroup'
import LineChart from './dashboard/LineChart'
import RaddarChart from './dashboard/RaddarChart'
import PieChart from './dashboard/PieChart'
import BarChart from './dashboard/BarChart'
import axios from 'axios'

const lineChartData = {
  newVisitis: {
    expectedData: [100, 120, 161, 134, 105, 160, 165],
    actualData: [120, 82, 91, 154, 162, 140, 145]
  },
  messages: {
    expectedData: [200, 192, 120, 144, 160, 130, 140],
    actualData: [180, 160, 151, 106, 145, 150, 130]
  },
  purchases: {
    expectedData: [80, 100, 121, 104, 105, 90, 100],
    actualData: [120, 90, 100, 138, 142, 130, 130]
  },
  shoppings: {
    expectedData: [130, 140, 141, 142, 145, 150, 160],
    actualData: [120, 82, 91, 154, 162, 140, 130]
  }
}

export default {
  name: 'Index',
  components: {
    PanelGroup,
    LineChart,
    RaddarChart,
    PieChart,
    BarChart
  },
  data() {
    return {
      lineChartData: lineChartData.newVisitis,
      versions:[],
      activeName:[],
    }
  },
  methods: {
    readVersions(){
      const _this=this;
      axios({method:'get',url:'./version.json'}).then(res=>{
        _this.versions=res.data.versions;
        if(res.data.versions.length>0){
        _this.activeName.push(res.data.versions[0].title);

        }
      })
    }
  },
  created(){
    this.readVersions();
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;
  min-height: 1000px;

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
