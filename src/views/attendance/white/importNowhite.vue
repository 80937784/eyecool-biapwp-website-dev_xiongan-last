<template>
  <!-- 导入表 -->
  <el-dialog title="新增白名单" :visible.sync="visible" width="1200px" :model="ruleForm" top="5vh" append-to-body :close-on-click-modal="false">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="姓名" prop="psnName">
        <el-input v-model="queryParams.psnName" placeholder="请输入姓名" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="人员标识" prop="psnUniqueId">
        <el-input v-model="queryParams.psnUniqueId" placeholder="请输入人员标识" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="部门" prop="deptId">
        <treeselect v-model="queryParams.deptId" :options="deptOptions" :show-count="true" style="width: 250px;" placeholder="请选择部门"  @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-table @row-click="clickRow" border ref="table" :data="dbTableList" @selection-change="handleSelectionChange" height="260px">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="psnUniqueId" label="人员标识" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="psnName" label="姓名" :show-overflow-tooltip="true"></el-table-column>
         <!-- <el-table-column prop="psnId" label="人id" :show-overflow-tooltip="true" ></el-table-column> -->
        <el-table-column prop="deptName" label="部门"></el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleImportTable">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { listNoWhite, importWhitePerson } from "@/api/attendance/white";
import Treeselect from "@riophae/vue-treeselect";
	import "@riophae/vue-treeselect/dist/vue-treeselect.css";
export default {
  components: {Treeselect},
  props: {
    ruleForms:{
      type:Array
    }
  },watch: {
    ruleForms:{
        handler(newl, old) {
          debugger;
          console.log(newl);
        this.ruleForm = newl;
        this.deptOptions = newl;
      },
    }
  },
  data() {
    return {
      // 遮罩层
      visible: false,
      // 选中数组值
      psnUniqueIds: [],
      psnIds:[],
      // 总条数
      total: 0,
      ruleForm:undefined,
      deptOptions: undefined,
      // 表数据
      dbTableList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        psnName: null,
        psnUniqueId: null,
        deptId:null,
      }
    };
  },
  methods: {
    // 显示弹框
    show() {
      this.getList();
      this.visible = true;
    },
    clickRow(row) {
      this.$refs.table.toggleRowSelection(row);
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.psnUniqueIds = selection.map(item => item.psnUniqueId);
      this.psnIds = selection.map(item => item.psnId);
      
    },
    // 查询表数据
    getList() {
      listNoWhite(this.queryParams).then(res => {
        if (res.code === 200) {
          this.dbTableList = res.rows;
          this.total = res.total;
        }
      });
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
    /** 导入按钮操作 */
    handleImportTable() {
      importWhitePerson({ psnUniqueIds: this.psnUniqueIds.join(",") ,psnIds:this.psnIds.join(",")}).then(res => {
        this.msgSuccess(res.msg);
        if (res.code === 200) {
          this.visible = false;
          this.$emit("ok");
        }
      });
    }
  }
};
</script>
