<template>
  <div>
    <el-dialog
      :title="title"
      width="700px"
      :visible.sync="dialogFormVisible"
      :before-close="beforeClose"
    >
      <el-form :rules="rules" ref="ruleForm" :model="ruleForm">
        <el-form-item
          label="时段名称"
          prop="timesName"
          :label-width="formLabelWidth"
        >
          <el-input
            v-model="ruleForm.timesName"
            placeholder="请输入时段名称"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="上班时间"
          prop="signIn"
          :label-width="formLabelWidth"
        >
          <el-time-picker
            v-model="ruleForm.signIn"
            :value-format="'HH:mm'"
            :picker-options="{
              format: 'HH:mm'
            }"
            style="width:100%"
            placeholder="请选择时间"
          >
          </el-time-picker>
        </el-form-item>
        <el-form-item
          label="下班时间"
          prop="signOut"
          :label-width="formLabelWidth"
        >
          <el-time-picker
            v-model="ruleForm.signOut"
            :value-format="'HH:mm'"
            :picker-options="{
              format: 'HH:mm'
            }"
            style="width:100%"
            placeholder="请选择时间"
          >
          </el-time-picker>
        </el-form-item>
        <el-form-item
          label="记迟到时间（分钟）"
          prop="lateNum"
          :label-width="formLabelWidth"
        >
          <el-input
            v-model="ruleForm.lateNum"
            type="number"
            autocomplete="off"
            placeholder="请输入记迟到时间（分钟）"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="记早退时间（分钟）"
          prop="leaveNum"
          :label-width="formLabelWidth"
        >
          <el-input
            v-model="ruleForm.leaveNum"
            type="number"
            autocomplete="off"
            placeholder="请输入记早退时间（分钟）"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="开始签到时间"
          prop="signInBegin"
          :label-width="formLabelWidth"
        >
          <el-time-picker
            v-model="ruleForm.signInBegin"
            :value-format="'HH:mm'"
            :picker-options="{
              format: 'HH:mm'
            }"
            style="width:100%"
            placeholder="请选择时间"
          >
          </el-time-picker>
        </el-form-item>
        <el-form-item
          label="结束签到时间"
          prop="signInEnd"
          :label-width="formLabelWidth"
        >
          <el-time-picker
            v-model="ruleForm.signInEnd"
            :value-format="'HH:mm'"
            :picker-options="{
              format: 'HH:mm'
            }"
            style="width:100%"
            placeholder="请选择时间"
          >
          </el-time-picker>
        </el-form-item>
        <el-form-item
          label="开始签退时间"
          prop="signOutBegin"
          :label-width="formLabelWidth"
        >
          <el-time-picker
            v-model="ruleForm.signOutBegin"
            value-format="HH:mm"
            :picker-options="{
              format: 'HH:mm'
            }"
            style="width:100%"
            placeholder="请选择时间"
          >
          </el-time-picker>
        </el-form-item>
        <el-form-item
          label="结束签退时间"
          prop="signOutEnd"
          :label-width="formLabelWidth"
        >
          <el-time-picker
            v-model="ruleForm.signOutEnd"
            :value-format="'HH:mm'"
            :picker-options="{
              format: 'HH:mm'
            }"
            style="width:100%"
            placeholder="请选择时间"
          >
          </el-time-picker>
        </el-form-item>
        <el-form-item
          label="打卡开始时间"
          prop="signInFlag"
          :label-width="formLabelWidth"
        >
          <el-time-picker
            v-model="ruleForm.signInFlag"
            :value-format="'HH:mm'"
            :picker-options="{
              format: 'HH:mm'
            }"
            style="width:100%"
            placeholder="请选择时间"
          >
          </el-time-picker>
        </el-form-item>
        <el-form-item
          label="打卡结束时间"
          prop="signOutFlag"
          :label-width="formLabelWidth"
        >
          <el-time-picker
            v-model="ruleForm.signOutFlag"
            :value-format="'HH:mm'"
            @change="timeChange(ruleForm.signOutFlag)"
            :picker-options="{
              format: 'HH:mm'
            }"
            style="width:100%"
            placeholder="请选择时间"
          >
          </el-time-picker>
        </el-form-item>
        <el-form-item label="是否必须签到" :label-width="formLabelWidth">
          <el-switch v-model="ruleForm.clockBegin"> </el-switch>
        </el-form-item>
        <el-form-item label="是否必须签退" :label-width="formLabelWidth">
          <el-switch v-model="ruleForm.clockEnd"> </el-switch>
        </el-form-item>
        <el-form-item label="参照规则" prop="clockRef" :label-width="formLabelWidth">
          <el-select
            v-model="ruleForm.clockRef"
            style="width:100%"
            placeholder="请选择参照规则"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <!------------------------------------------------- 按钮区域 ------------------------------------------->
      <div slot="footer" class="dialog-footer">
        <el-button @click="beforeClose">关 闭</el-button>
        <el-button type="primary" @click="submitForm"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  props: {
    visible: {
      type: Boolean
    },
    title: {
      type: String
    },
    ruleForms:{
      type:Object
    }
  },
  filters: {
    timeFormat(value){
      let arr = value.split(':');
      console.log(arr);
    }
  },
  watch: {
    // 监控visible，保证父传子的持久性
    visible: {
      handler(newl, old) {
        this.dialogFormVisible = newl;
      },
      deep: true,
      immediate: true
    },
    ruleForms:{
        handler(newl, old) {
        this.ruleForm = newl;
      },
    }
  },
  data() {
    // 表单验证规则列表 
    const selectTime = [
      { required: true, message: "请选择时间", trigger: "blur" }
    ];
    const inputTime = [
      { required: true, message: "请输入时间", trigger: "blur" }
    ];
    const name = [
      { required: true, message: "请输入时段名称", trigger: "blur" }
    ];
    const selectRule = [
      { required: true, message: "请选择参照规则", trigger: "blur" }   
    ];
    return {
      dialogFormVisible: false, // 弹窗显示控制
      // 表单数据
      ruleForm: {
        timesName: "",
        signIn: "",
        signOut: "",
        lateNum: "",
        leaveNum: "",
        signInBegin: "",
        signInEnd: "",
        signOutBegin: "",
        signOutEnd: "",
        signInFlag: "",
        signOutFlag: "",
        // createBy: "",
        // updateBy: "",
        // createTime: "",
        // updateTime: "",
        // businessId: null,
        clockBegin: false,
        clockEnd: false,
        clockRef: ""
      },
      // 表单验证
      rules: {
        timesName: name,
        signIn: selectTime,
        signOut: selectTime,
        lateNum: inputTime,
        leaveNum: inputTime,
        signInBegin: selectTime,
        signInEnd: selectTime,
        signOutBegin: selectTime,
        signOutEnd: selectTime,
        signInFlag: selectTime,
        signOutFlag: selectTime,
        clockRef:selectRule
      },
      // 参照规则列表
      options: [
        {
          value: "0",
          label: "早上上班规则"
        },
        {
          value: "1",
          label: "中午下班规则"
        },
        {
          value: "2",
          label: "下午上班规则"
        },
        {
          value: "3",
          label: "晚上下班规则"
        }  
      ],
      formLabelWidth: "160px"
    };
  },
  methods: {
    // 重新关闭回调
    beforeClose() {
      this.$refs.ruleForm.resetFields();
      this.$emit("close", false);
    },
    // 重置
    reset() {
      this.ruleForm = {
        timesName: "",
        signIn: "",
        signOut: "",
        lateNum: "",
        leaveNum: "",
        signInBegin: "",
        signInEnd: "",
        signOutBegin: "",
        signOutEnd: "",
        signInFlag: "",
        signOutFlag: "",
        // createBy: "",
        // updateBy: "",
        // createTime: "",
        // updateTime: "",
        // businessId: null,
        clockBegin: false,
        clockEnd: false,
        clockRef: ""
      };
    },
    // 去除秒
    timeChange(time) {
      let arr = time.split(':');
      console.log(arr);
    },
    // 表单提交
    submitForm() {
        console.log(this.ruleForm);
        return
    this.$refs.ruleForm.validate((valid) => {
        if (valid) {
        this.$emit('close',false);
        this.$refs.ruleForm.resetFields();
        alert('submit!'); 
        } else {
        console.log('error submit!!');
        return false;
        }
    });
    },
  }
};
</script>
<style scoped>
.container {
  padding-right: 10px;
}
</style>
