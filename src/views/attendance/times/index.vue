<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="时段名称" prop="timesName">
        <el-input
          v-model="queryParams.timesName"
          placeholder="请输入时段名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['attendance:times:add']"
        >新增</el-button>
      </el-col>
      
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['attendance:times:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['attendance:times:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['attendance:times:export']"
        >导出</el-button>
      </el-col>
	  <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="timesList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="假期管理id" align="center" prop="id" /> -->
      <el-table-column label="时段名称" align="center" prop="timesName" />
      <el-table-column label="上班时间" align="center" prop="signIn" />
      <el-table-column label="下班时间" align="center" prop="signOut" />
      <!-- <el-table-column label="记迟到时间" align="center" prop="lateNum" />
      <el-table-column label="记早退时间" align="center" prop="leaveNum" /> -->
      <el-table-column label="开始签到时间" align="center" prop="signInBegin" />
      <el-table-column label="结束签到时间" align="center" prop="signInEnd" />
      <el-table-column label="开始签退时间" align="center" prop="signOutBegin" />
      <el-table-column label="结束签退时间" align="center" prop="signOutEnd" />
      <!-- <el-table-column label="必须签到" align="center" prop="signInFlag" />
      <el-table-column label="必须签退" align="center" prop="signOutFlag" />
      <el-table-column label="商户id" align="center" prop="businessId" /> -->
      <!-- <el-table-column label="打卡开始时间" align="center" prop="clockBegin" />
      <el-table-column label="打卡结束时间" align="center" prop="clockEnd" />
      <el-table-column label="参考规则" align="center" prop="clockRef" />
      <el-table-column label="租户ID" align="center" prop="tenantId" /> -->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['attendance:times:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['attendance:times:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改考勤时间段对话框 -->
    <!-- <a-modal
    :title="title"
    :width="800"
    :visible="open111"
    :confirmLoading="confirmLoading"
    @ok="submitForm"
    @cancel="cancel"
    cancelText="关闭">
    
    <a-spin :spinning="confirmLoading">
      <a-form :form="form" ref="form">
      
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
  </a-modal> -->
  <time-pick :title="title" :ruleForms="form" :visible="open" @close="cancel" @saveForm="saveForm"></time-pick>
  </div>
</template>

<script>
  import pick from 'lodash.pick'
  import moment from "moment"
  import { listTimes, getTimes, delTimes, addTimes, updateTimes, exportTimes } from "@/api/attendance/times";
  import TimePick from './TimePick'
export default {
  name: "Times",
  components: {TimePick},
  data() {
    return {
         id:"",
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
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 考勤时间段表格数据
      timesList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        timesName: null,
        signIn: null,
        signOut: null,
        lateNum: null,
        leaveNum: null,
        signInBegin: null,
        signInEnd: null,
        signOutBegin: null,
        signOutEnd: null,
        signInFlag: null,
        signOutFlag: null,
        businessId: null,
        clockBegin: null,
        clockEnd: null,
        clockRef: null,
        tenantId: null
      },
      // 表单参数
      confirmLoading: false,
      form: {},
      // 表单校验
      rules: {
        timesName: [
          { required: true, message: "时段名称不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
    //this.form = this.$form.createForm();
  },
 
  methods: {
    /** 查询考勤时间段列表 */
    getList() {
      this.loading = true;
      listTimes(this.queryParams).then(response => {
        this.timesList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
   
    // 表单重置
    reset() {
      this.form = {
        id: null,
        timesName: null,
        signIn: null,
        signOut: null,
        lateNum: null,
        leaveNum: null,
        signInBegin: null,
        signInEnd: null,
        signOutBegin: null,
        signOutEnd: null,
        signInFlag: null,
        signOutFlag: null,
        createBy: null,
        updateBy: null,
        createTime: null,
        updateTime: null,
        businessId: null,
        clockBegin: null,
        clockEnd: null,
        clockRef: null,
        tenantId: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.id="";
      this.reset();
      this.form.clockRef="0";
      this.form.signInFlag=true;
      this.form.signOutFlag=true;
      this.open = true;
      this.title = "添加考勤时间段";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getTimes(id).then(response => {
      // debugger;
        this.title = "修改考勤时间段";
        this.open = true ;
        this.form = response.data;
        this.id = this.form.id;
        if(this.form.signInFlag=="T"){
          this.form.signInFlag = true;
         }else{
          this.form.signInFlag = false;
         }

         if(this.form.signOutFlag =="T"){
          this.form.signOutFlag = true;
         }else{
          this.form.signOutFlag =false;
         }
        //console.log(this.form);
        
      });
    },
    saveForm(saveForm){
      debugger;
      saveForm.id = this.id;
      addTimes(saveForm).then(response => {
             if(saveForm.id != ""){
              this.msgSuccess("修改成功");
             } else{
              this.msgSuccess("新增成功");
             }
              this.open = false;
              this.getList();
            });
    },
    /** 提交按钮 */
    submitForm(saveForm) {

      // this.$refs["form"].validate(valid => {
      //   if (valid) {
          if (saveForm.id != null) {
            updateTimes(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addTimes(saveForm).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
      //   }
      // });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除考勤时间段编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delTimes(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有考勤时间段数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportTimes(queryParams);
        }).then(response => {
          this.download(response.msg);
        })
    }
  }
};
</script>
