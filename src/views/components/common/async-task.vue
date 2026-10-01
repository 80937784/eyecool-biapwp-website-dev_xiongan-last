<template>
  <!-- 异步任务结果查询 -->
  <el-dialog title="异步任务查询" :visible.sync="open" width="800px" append-to-body :close-on-click-modal="false" custom-class="ec-async-task" @open="reset" @close="close">
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="任务ID">
        <el-input v-model="form.taskId" />
      </el-form-item>
      <el-form-item label="任务结果" v-if="form.result">
        <vue-json-editor :value="form.result" :showBtns="false" mode="view" lang="zh" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">查 询</el-button>
      <el-button @click="close">关 闭</el-button>
    </div>
  </el-dialog>
</template>
<script>
import vueJsonEditor from 'vue-json-editor'
import { asynctaskResult } from "@/api/common/asynctask";
export default {
  components: {
    vueJsonEditor
  },
  data() {
    return {
      // 表单
      form: {
        taskId: null,
        result: null
      },
      // 表单校验规则
      rules: {
        taskId: [{
          required: true, message: '任务ID不能为空', trigger: 'blur'
        }]
      }
    }
  },
  props: {
    open: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    // 查询结果
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (!valid) {
          return;
        }
        asynctaskResult(this.form.taskId).then(res => {
          if (res.data.msg && res.data.msg.length) {
            res.data.msg = res.data.msg.split('<br/>');
            if (res.data.msg.length == 1) {
              res.data.msg = res.data.msg[0]
            }
          }
          this.form.result = res.data
        })
      });
    },
    // 重置查询
    reset() {
      this.form = {
        taskId: null,
        result: null
      }
      this.resetForm("form");
    },
    // 取消查询
    close() {
      this.$emit('close')
    }
  }
}
</script>