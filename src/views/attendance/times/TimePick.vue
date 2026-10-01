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
        <!-- <el-form-item
          label="打卡开始时间"
          prop="clockBegin"  
          :label-width="formLabelWidth"
        >
          <el-time-picker
            v-model="ruleForm.clockBegin"
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
          prop="clockEnd" 
          :label-width="formLabelWidth"
        >
          <el-time-picker
            v-model="ruleForm.clockEnd"
            :value-format="'HH:mm'"
            :picker-options="{
              format: 'HH:mm'
            }"
            style="width:100%"
            placeholder="请选择时间"
          >
          </el-time-picker>
        </el-form-item> -->
        <!-- <el-form-item label="是否必须签到" :label-width="formLabelWidth">
          <el-switch v-model="ruleForm.signOutFlag"> </el-switch> 
        </el-form-item>
        <el-form-item label="是否必须签退" :label-width="formLabelWidth">
          <el-switch v-model="ruleForm.signInFlag"> </el-switch>
        </el-form-item> -->
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
          console.log(newl);
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
        id:"",
        signIn: "",
        signOut: "",
        lateNum: "",
        leaveNum: "",
        signInBegin: "",
        signInEnd: "",
        signOutBegin: "",
        signOutEnd: "",
        signInFlag: true,
        signOutFlag: true,
        // createBy: "",
        // updateBy: "",
        // createTime: "",
        // updateTime: "",
        // businessId: null,
        clockBegin: null,
        clockEnd: null,
        clockRef: "0"
      },
      // signOutFlag signInFlag
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
          label: "上午班"
        },
        {
          value: "1",
          label: "下午班"
        },
        {
          value: "2",
          label: "夜班"
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
        signInFlag: true,
        signOutFlag: true,
        // createBy: "",
        // updateBy: "",
        // createTime: "",
        // updateTime: "",
        // businessId: null,
        clockBegin: "",
        clockEnd: "",
        clockRef: "0"
      };
    },
    // 表单提交
    submitForm() {
      
    this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          debugger;
          if (this.ruleForm.clockRef != '2' && this.ruleForm.signOut <= this.ruleForm.signIn) {
          this.$message.warning("下班时间应晚于上班时间！");
          return false;
          }
          if (this.ruleForm.clockRef != '2' && this.ruleForm.signInBegin > this.ruleForm.signIn) {
          this.$message.warning("开始签到时间应早于等于开始上班时间！");
          return false;
        }
        if (this.ruleForm.clockRef != '2' &&  this.ruleForm.signInEnd <= this.ruleForm.signInBegin) {
          that.$message.warning("结束签到时间应晚于开始签到时间！");
          return false;
        }
        if (this.ruleForm.clockRef != '2' &&  this.ruleForm.signOutEnd <= this.ruleForm.signOutBegin) {
          this.$message.warning("结束签退时间应晚于开始签退时间！"); 
          return false;
        }
        if (this.ruleForm.clockRef != '2' &&  this.ruleForm.signOutBegin <= this.ruleForm.signInEnd) {
          this.$message.warning("开始签退时间应晚于结束签到时间！"); 
          return false;
        }
        if (this.ruleForm.clockRef != '2' &&  this.ruleForm.signInEnd > this.ruleForm.signOut) {
          this.$message.warning("结束签到时间应早于下班时间！"); 
          return false;
        }
         if(this.ruleForm.signInFlag){
          this.ruleForm.signInFlag = "T";
         }else{
          this.ruleForm.signInFlag ="F";
         }

         if(this.ruleForm.signOutFlag){
          this.ruleForm.signOutFlag = "T";
         }else{
          this.ruleForm.signOutFlag ="F";
         }
        this.$emit('saveForm', this.ruleForm);
        this.$emit('close',false);
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
