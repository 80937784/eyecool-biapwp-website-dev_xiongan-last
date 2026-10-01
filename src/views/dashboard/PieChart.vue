<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'
const defaultOption = {
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)'
  },
  legend: {
    left: 'center',
    bottom: '20',
    data: ['Industries']
  },
  series: [
    {
      name: 'WEEKLY WRITE ARTICLES',
      type: 'pie',
      roseType: 'radius',
      radius: '40%',
      data: [
        { value: 10, name: 'Industries' },
        {},
      ],
      animationEasing: 'cubicInOut',
      animationDuration: 200
    }
  ]
};
export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    },
    option: {
      type: Object,
      default: null,
    }
  },
  data() {
    return {
      chart: null,
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  watch: {
    option: {
      handler(newVal, oldVal) {
        this.option = newVal;
        this.initChart();
      },
      deep:true,
    }
  },

  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.chart.setOption(this.option ? this.option : defaultOption);
    }
  }
}
</script>
