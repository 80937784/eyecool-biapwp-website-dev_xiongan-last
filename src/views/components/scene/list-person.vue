<template>
  <el-dialog title="选择人员" :visible.sync="childOpen" width="50%" append-to-body :before-close="beforeClose" :close-on-click-modal="false">
  <!-- <el-dialog title="选择人员" :visible.sync="childOpen" width="50%" append-to-body > -->

    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="人员标识" prop="uniqueId">
        <el-input v-model="queryParams.uniqueId" placeholder="请输入人员标识" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入姓名" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="手机" prop="phone">
        <el-input v-model="queryParams.phone" placeholder="请输入手机" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" border :data="personList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="人员标识" align="center" prop="uniqueId" />
      <el-table-column label="姓名" align="center" prop="name" />
      <el-table-column label="手机" align="center" prop="phone" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180" />
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitSelect()">确 定</el-button>
      <el-button @click="close()">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { listChannelUnBindPerson } from "@/api/scene/channelBusi";
import { listSubUnBindPerson } from "@/api/scene/subtreasuryBusi";
export default {
  name: "ListPerson",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      selections: [],
      childOpen:false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 人员基础信息表格数据
      personList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        uniqueId: null,
        name: null,
        phone: null,
        
      },
    };
  },
  watch: { 
    // 监控父组件传来的数据
    open(curval,oldVal){
      this.childOpen = curval;
      // 如果是true的话,则表示打开弹窗，请求接口获取表格初始数据
      if(curval)this.getList();
    }
  },
  props: {
    // 是否显示弹窗
    open: {
      type: Boolean,
      default: false
    },
    // 场景主键
    channelId: {
      type: String,
      default: null
    },
    // 子场景主键
    subTreasuryId: {
      type: String,
      default: null
    }
  },
  created() {
    this.childOpen = this.open;
  },
  methods: {
    /** 查询人员列表 */
    getList() {
      this.loading = true;
      if (!this.channelId && !this.subTreasuryId) {
        this.personList = [];
        this.total = 0;
        this.loading = false;
        return;
      }
      if (this.subTreasuryId) {
        listSubUnBindPerson(this.subTreasuryId, this.queryParams).then(response => {
          this.personList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
      } else {
        listChannelUnBindPerson(this.channelId, this.queryParams).then(response => {
          this.personList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
      }
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
      this.selections = selection;
    },
    // 提交选择
    submitSelect() {
      if (!this.selections || !this.selections.length) {
        this.msgError('请至少选择一条数据');
        return;
      }
      this.$emit('select-over', this.selections)
      this.close()
    },
    // 右上角关闭弹窗
    beforeClose() {
      this.$emit('close')
    },
    // 关闭弹窗
    close() {
      Object.assign(this.$data, this.$options.data())
      this.$emit('close')
    }
  }
}
</script>
<style lang="scss">
</style>