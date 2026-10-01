<template>
  <a-time-picker :value="renderTimeString" format="HH:mm" @change="onChange" v-bind="$attrs" v-on="event.other" placeholder="请选择"></a-time-picker>
</template>
<script>
import moment from 'moment'
export default {
  name: 'EyecoolTimePicker',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: String
  },
  methods: {
    onChange (time, timeString) {
      let timeEmit = time ? moment(time).format('HH:mm') : null
      this.$emit('change', timeEmit)
    }
  },
  computed: {
    renderTimeString () {
      let val =  this.value ? moment(new Date().toLocaleDateString() + ' ' + this.value) : null
      return val
    },
    event () {
      const { change, ...other } = this.$listeners
      return {
        change: this.onChange,
        other
      }
    }
  }
}
</script>