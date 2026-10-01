<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="100px">
      
      <el-form-item label="人员标识" prop="uniqueId">
        <el-input v-model="queryParams.uniqueId" placeholder="请输入人员标识" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="数据来源" prop="datasource">
        <el-select v-model="queryParams.datasource" placeholder="数据来源" clearable size="small" style="width: 200px">
          <el-option v-for="dict in datasourceOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="状态" clearable size="small" style="width: 200px">
          <el-option v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table border v-loading="loading" :data="personList">
      <el-table-column label="序号" align="center">
        <template slot-scope="scope">
            {{scope.$index + 1}}
        </template>    
      </el-table-column>  
      <el-table-column label="人员标识" align="center" prop="uniqueId">
      </el-table-column>
      <el-table-column label="质量得分" align="center" prop="qualityScore" />
      <el-table-column label="是否加密" align="center" prop="encrypted">
        <template slot-scope="scope">
          <div>{{handleShowEncrypted(scope.row.encrypted)}}</div>
        </template>
      </el-table-column>
      <el-table-column label="数据来源" align="center" prop="datasource">
        <template slot-scope="scope">
          <div>{{handleShowDatasource(scope.row.datasource)}}</div>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <div>{{handleShowStatus(scope.row.status)}}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作时间" align="center" prop="updateTime" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="100">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="handleDetails(scope.row)">详细</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
    <!-- 详情展示 -->
    <el-dialog title="人脸详情" :visible.sync="open" width="600px" append-to-body :close-on-click-modal="false">
      <div>
        <div class="emply" v-if="emply">
          暂无图片信息
        </div>
        <img v-else :src="'data:image/png;base64,'+ faceImage" style="width:400px;height:340px">
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { faceListVisitor,listByUidOrName,visitorFacreDetail  } from "@/api/basedata/visitor";
import { genQrCode } from "@/api/tool/qrcode";
export default {
  data() {
    return {
      // 判断图片是否为空
      emply:false,
      // 二维码
      erweima:null,
      // 遮罩层
      loading: true,
      // 二维码显示
      isShow:false,
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
        username: null,
        phone: null,
        inviterId: null,
        effectiveStatus: null,
      },
      // 访客状态状态字典
      visitorOptions: [],
      // 远程搜索加载
      selectLoading:false,
      // 邀请人远程搜索
      options:[],
      // 人脸图片
      faceImage:null,
      // 详情展示
      open:false,
      // 数据来源数据字典
      datasourceOptions: [],
      // 状态数据字典
      statusOptions: [],
      // 是否加密数据字典
      encryptedOptions: [],
    };
  },
  created() {
    this.getDicts("visitor_effective_status").then(response => {
      this.visitorOptions = response.data;
    });
    this.getList();
    this.createCode();
    this.getDicts("apply_data_source").then(response => {
      this.datasourceOptions = response.data;
    });
    this.getDicts("sys_normal_disable").then(response => {
      this.statusOptions = response.data;
    });
    this.getDicts("apply_encrypted").then(response => {
      this.encryptedOptions = response.data;
    });
  },
  methods: {
    /** 数据来源显示转换 */
    handleShowDatasource(val) {
      return this.selectDictLabel(this.datasourceOptions, val);
    },
    /** 状态显示转换 */
    handleShowStatus(val) {
      return this.selectDictLabel(this.statusOptions, val);
    },
    /**是否加密显示转换 */
    handleShowEncrypted(val) {
      return this.selectDictLabel(this.encryptedOptions, val);
    },
    /** 二维码生成 */
    createCode() {
        genQrCode({ content: "http://www.baidu.com" }).then(res => {
          this.erweima = res.data.qrcodeImgBase64
      })
    },
      //下载
    downloadFile(fileName, content) {
      let aLink = document.createElement('a');
      let blob = this.base64ToBlob(content); //new Blob([content]);

      let evt = document.createEvent("HTMLEvents");
      evt.initEvent("click", true, true);//initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
      aLink.download = fileName;
      aLink.href = URL.createObjectURL(blob);

      // aLink.dispatchEvent(evt);
      aLink.click()
    },
    //base64转blob
    base64ToBlob(code) {
      let parts = code.split(';base64,');
      let contentType = parts[0].split(':')[1];
      let raw = window.atob(parts[1]);
      let rawLength = raw.length;

      let uInt8Array = new Uint8Array(rawLength);

      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      return new Blob([uInt8Array], { type: contentType });
    },
    /** 表格生效过滤 */
    getStatus(status) {
        switch (status) {
        case '1':
            return "生效中"
            break;
        case '0':
            return "未生效"
            break;
        case '2':
            return "已失效"
            break;
        default:
            break;
        }
    },
    getColor(status) {
        switch (status) {
        case '1':
            return "#67C23A"
            break;
        case '0':
            return "#909399"
            break;
        case '2':
            return "#F56C6C"
            break;
        default:
            break;
        }
    },
    /** 打开二维码显示 */
    showCode() {
        this.isShow = true;
    },
    /** 查询人员基础信息列表 */
    getList() {
      this.loading = true;
      faceListVisitor(this.queryParams).then(response => {
        this.personList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 远程搜索 */
    remoteMethod(query) {
        console.log(query);
        if (query !== '') {
          this.selectLoading = true;
          listByUidOrName(query).then(res=> {
              this.selectLoading = false;
              this.options = res.rows;
          })
        } else {
          this.options = [];
        }
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {
        pageNum: 1,
        pageSize: 10,
        username: null,
        phone: null,
        inviterId: null,
        effectiveStatus: null,
      };
      this.resetForm("queryForm");
      this.handleQuery();
    },
   /** 详情展示 */
    handleDetails(row) {
      this.open = true;
      visitorFacreDetail(row.id).then(res=> {
        if(!res.data.imgBase64) {
          this.emply = true;
          this.faceImage = null;
          return;
        }
        this.emply = false;
        this.faceImage = res.data.imgBase64;
        
      })
    }
  }
};
</script>
<style lang="scss" scoped>
.box {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .tips {
        font-size: 14px;
        color: #F56C6C;
    }
    margin-bottom: 20px;
}
.emply {
  width: 400px;
  height: 340px;
  text-align: center;
  line-height: 340px;
  font-size: 24px;
}
</style>
