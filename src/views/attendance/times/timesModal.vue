<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭">
    
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
      
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="时段名称">
          <a-input placeholder="请输入时段名称" v-decorator="['timesName', {rules: [{ required: true, message: '请输入时段名称'}]} ]" maxlength="50"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="上班时间">
          <a-time-picker style="width: 100%" format="HH:mm" v-model="signInModel" v-decorator="['signInModel', {rules: [{ required: true, message: '请输入上班时间'}]} ]"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="下班时间">
          <a-time-picker style="width: 100%" format="HH:mm" v-model="signOutModel" v-decorator="['signOutModel', {rules: [{ required: true, message: '请输入下班时间'}]} ]"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="记迟到时间（分钟）">
          <a-input-number style="width: 100%" v-decorator="[ 'lateNum', {rules: [{ required: true, message: '请输入记迟到时间（分钟）'}]}]" :min="1" :max="120"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="记早退时间（分钟）">
          <a-input-number style="width: 100%" v-decorator="[ 'leaveNum', {rules: [{ required: true, message: '请输入记早退时间（分钟）'}]}]" :min="1" :max="240"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="开始签到时间">
          <a-time-picker style="width: 100%" format="HH:mm" v-model="signInBeginModel" v-decorator="['signInBeginModel', {rules: [{ required: true, message: '请输入开始签到时间'}]} ]"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="结束签到时间">
          <a-time-picker style="width: 100%" format="HH:mm" v-model="signInEndModel" v-decorator="['signInEndModel', {rules: [{ required: true, message: '请输入结束签到时间'}]} ]"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="开始签退时间">
          <a-time-picker style="width: 100%" format="HH:mm" v-model="signOutBeginModel" v-decorator="['signOutBeginModel', {rules: [{ required: true, message: '请输入开始签退时间'}]} ]"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="结束签退时间">
          <a-time-picker style="width: 100%" format="HH:mm" v-model="signOutEndModel" v-decorator="['signOutEndModel', {rules: [{ required: true, message: '请输入结束签退时间'}]} ]"/>
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="打卡开始时间">
          <a-time-picker style="width: 100%" format="HH:mm" v-model="clockBeginModel" v-decorator="['clockBeginModel', {rules: [{ required: true, message: '请输入打卡开始时间'}]} ]"/>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="打卡结束时间">
          <a-time-picker style="width: 100%" format="HH:mm" v-model="clockEndModel" v-decorator="['clockEndModel', {rules: [{ required: true, message: '请输入打卡结束时间'}]} ]"/>
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="是否必须签到">
          <a-switch checkedChildren="是" unCheckedChildren="否" v-model="signInFlagSwitch"/>
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="是否必须签退">
          <a-switch checkedChildren="是" unCheckedChildren="否" v-model="signOutFlagSwitch"/>
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="参照规则">
          <a-select :key="index" size="large" defaultValue="0" v-model="clockRefModel" v-decorator="['clockRefModel', {rules: [{ required: false, message: '请选择参照规则'}]} ]">
            <a-select-option value="0">早上上班规则</a-select-option>
            <a-select-option value="1">中午下班规则</a-select-option>
            <a-select-option value="2">下午上班规则</a-select-option>
            <a-select-option value="3">晚上下班规则</a-select-option>
          </a-select>
        </a-form-item>

      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import { listTimes, getTimes, delTimes, addTimes, updateTimes, exportTimes } from "@/api/attendance/times";
  import pick from 'lodash.pick'
  import moment from "moment"

  export default {
    name: "AtdTimesModal",
    data () {
      return {
        title:"操作",
        visible: false,
        signInFlagSwitch:true,
        signOutFlagSwitch:true,
        signInModel: null,
        signOutModel: null,
        signInBeginModel: null,
        signInEndModel: null,
        signOutBeginModel: null,
        signOutEndModel: null,
        clockRefModel: '0',
        index:0,
        clockBeginModel: null,
        clockEndModel: null,
        model: {},
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },

        confirmLoading: false,
        form: this.$form.createForm(this),
        validatorRules:{
        },
        url: {
          add: "/com.eyecool.attendance/atdTimes/add",
          edit: "/com.eyecool.attendance/atdTimes/edit",
        },
      }
    },
    created () {
    },
    methods: {
      add () {
        this.edit({});
      },
      edit (record) {
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.visible = true;

        if(record.signInFlag != null){
          this.signInFlagSwitch = record.signInFlag=='T'?true:false;
        }
        if(record.signOutFlag != null){
          this.signOutFlagSwitch = record.signOutFlag=='T'?true:false;
        }
        //signInModel signOutModel signInBeginModel signInEndModel signOutBeginModel signOutEndModel
        console.log(moment(this.model.signIn, 'HH:mm'));
        //this.form.setFieldsValue({punchTime: this.model.punchTime ? moment(this.model.punchTime, 'YYYY-MM-DD HH:mm:ss') : null})
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'timesName','signIn','signOut','lateNum','leaveNum','signInBegin','signInEnd','signOutBegin','signOutEnd','signInFlag','signOutFlag','businessId','clockBegin','clockEnd','clockRef'))
		      //时间格式化
          this.form.setFieldsValue({signInModel: this.model.signIn ? moment(this.model.signIn, 'HH:mm') : null})
          this.form.setFieldsValue({signOutModel: this.model.signOut ? moment(this.model.signOut, 'HH:mm') : null})
          this.form.setFieldsValue({signInBeginModel: this.model.signInBegin ? moment(this.model.signInBegin, 'HH:mm') : null})
          this.form.setFieldsValue({signInEndModel: this.model.signInEnd ? moment(this.model.signInEnd, 'HH:mm') : null})
          this.form.setFieldsValue({signOutBeginModel: this.model.signOutBegin ? moment(this.model.signOutBegin, 'HH:mm') : null})
          this.form.setFieldsValue({signOutEndModel: this.model.signOutEnd ? moment(this.model.signOutEnd, 'HH:mm') : null})

          this.form.setFieldsValue({clockBeginModel: this.model.clockBegin ? moment(this.model.clockBegin, 'HH:mm') : null})
          this.form.setFieldsValue({clockEndModel: this.model.clockEnd ? moment(this.model.clockEnd, 'HH:mm') : null})
          this.form.setFieldsValue({clockRefModel: this.model.clockRef})

          this.signInModel = this.model.signIn ? moment(this.model.signIn, 'HH:mm') : null;
          this.signOutModel = this.model.signOut ? moment(this.model.signOut, 'HH:mm') : null;
          this.signInBeginModel = this.model.signInBegin ? moment(this.model.signInBegin, 'HH:mm') : null;
          this.signInEndModel = this.model.signInEnd ? moment(this.model.signInEnd, 'HH:mm') : null;
          this.signOutBeginModel = this.model.signOutBegin ? moment(this.model.signOutBegin, 'HH:mm') : null;
          this.signOutEndModel = this.model.signOutEnd ? moment(this.model.signOutEnd, 'HH:mm') : null;

          this.clockBeginModel = this.model.clockBegin ? moment(this.model.clockBegin, 'HH:mm') : null;
          this.clockEndModel = this.model.clockEnd ? moment(this.model.clockEnd, 'HH:mm') : null;
          this.clockRefModel = this.model.clockRef;
          index++;
        });

      },
      close () {
        this.$emit('close');
        this.visible = false;
      },
      handleOk () {
        const that = this;
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            that.model.signInFlag = that.signInFlagSwitch?'T':'F';
            that.model.signOutFlag = that.signOutFlagSwitch?'T':'F';
            debugger

            console.log('this.signInModel:')
            console.log(that.signInModel ? that.signInModel.format('HH:mm') : null)
            console.log('this.model.signIn:')
            console.log(that.model.signIn)

            that.model.signIn = that.signInModel ? that.signInModel.format('HH:mm') : null;
            that.model.signOut = that.signOutModel ? that.signOutModel.format('HH:mm') : null;
            that.model.signInBegin = that.signInBeginModel ? that.signInBeginModel.format('HH:mm') : null;
            that.model.signInEnd = that.signInEndModel ? that.signInEndModel.format('HH:mm') : null;
            that.model.signOutBegin = that.signOutBeginModel ? that.signOutBeginModel.format('HH:mm') : null;
            that.model.signOutEnd = that.signOutEndModel ? that.signOutEndModel.format('HH:mm') : null;

            that.model.clockBegin = that.clockBeginModel ? that.clockBeginModel.format('HH:mm') : null;
            that.model.clockEnd = that.clockEndModel ? that.clockEndModel.format('HH:mm') : null;
            that.model.clockRef = that.clockRefModel;

            if (!that.checkTime(that.model)) {
              return;
            }

            that.confirmLoading = true;
            let httpurl = '';
            let method = '';
            if(!that.model.id){
              httpurl+=that.url.add;
              method = 'post';
            }else{
              httpurl+=that.url.edit;
               method = 'put';
            }
            let formData = Object.assign(that.model, values);
            //时间格式化
            console.log('>>>>>>>>>formData:')
            console.log(formData)
            httpAction(httpurl,formData,method).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.$emit('ok');
              }else{
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
              that.close();
            })

          }
        })
      },
      checkTime(model){
        const that = this;
        let flag = true;
        debugger
        if (model.signOut <= model.signIn) {
          that.$message.warning("下班时间应晚于上班时间！");
          flag = false;
          return flag;
        }
        if (model.signInBegin > model.signIn) {
          that.$message.warning("开始签到时间应早于等于开始上班时间！");
          flag = false;
          return flag;
        }
        if (model.signInEnd <= model.signInBegin) {
          that.$message.warning("结束签到时间应晚于开始签到时间！");
          flag = false;
          return flag;
        }
        if (model.signOutEnd <= model.signOutBegin) {
          that.$message.warning("结束签退时间应晚于开始签退时间！");
          flag = false;
          return flag;
        }
        if (model.signOutBegin <= model.signInEnd) {
          that.$message.warning("开始签退时间应晚于结束签到时间！");
          flag = false;
          return flag;
        }
        if (model.signInEnd > model.signOut) {
          that.$message.warning("结束签到时间应早于下班时间！");
          flag = false;
          return flag;
        }
        // if (model.signOutBegin < model.signOut) {
        //   that.$message.warning("开始签退时间应晚于下班时间！");
        //   flag = false;
        //   return flag;
        // }
        return flag;
      },
      handleCancel () {
        this.close()
      },


    }
  }
</script>

<style lang="less" scoped>

</style>