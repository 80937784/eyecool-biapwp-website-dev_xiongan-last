<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="100px">
     
      <el-form-item label="访客姓名" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入访客姓名" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="访客手机号" prop="phone">
        <el-input v-model="queryParams.phone" placeholder="请输入访客手机号" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="被访人" prop="phone">
          <el-select v-model="queryParams.inviterId" filterable remote reserve-keyword placeholder="请输入被访人" :remote-method="remoteMethod" :loading="selectLoading">
            <el-option
            v-for="item in options"
            :key="item.id"
            :label="item.name"
            :value="item.id">
            </el-option>
        </el-select>
        <!-- <el-input v-model="queryParams.inviterId" placeholder="请输入被访人" clearable size="small" @keyup.enter.native="handleQuery" /> -->
      </el-form-item>
      <el-form-item label="生效状态" prop="status">
        <el-select v-model="queryParams.effectiveStatus" placeholder="生效状态" clearable size="small" style="width: 200px">
          <el-option v-for="dict in visitorOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item>
         <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
          <el-button type="primary" size="small" @click="showCode">H5二维码</el-button>
        </el-col>
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="personList">
      <el-table-column label="序号" align="center">
        <template slot-scope="scope">
            {{scope.$index + 1}}
        </template>    
      </el-table-column>  
      <el-table-column label="访客姓名" align="center" prop="name" />
      <el-table-column label="生效状态" align="center" prop="effectiveStatus">
        <template slot-scope="scope">
            <span :style="{'color':getColor(scope.row.effectiveStatus)}">
                {{getStatus(scope.row.effectiveStatus)}}
            </span>   
        </template>
      </el-table-column>
      <el-table-column label="访客手机号" align="center" prop="phone" />
      <el-table-column label="被访人" align="center" prop="inviterName" />
      <el-table-column label="到访时段" align="center" width="500px" prop="visitTimePeriod" />
      <el-table-column label="操作时间" align="center" prop="updateTime" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="100">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="handleShowDetail(scope.row)">详情</el-button>
          <el-button size="mini" type="text" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
    <!-- 人员基础信息导入对话框 -->
    <el-dialog title="二维码" :visible.sync="isShow" width="600px" append-to-body :close-on-click-modal="false">
        <div class="box">
            <img :src="'data:image/jpeg;base64,' + erweima" alt="">
            <div class="tips">* 扫码可在移动端进行访客预约</div>
            <el-button type="primary" @click="download" style="width:200px;margin-top:20px">下载到本地</el-button>
        </div>
    </el-dialog>
    <el-dialog title="详情" :visible.sync="open" width="600px" append-to-body :close-on-click-modal="false">
      <el-form ref="form" :model="form" label-width="80px">
           <el-tabs ref="tabs" v-model="activeTabName" type="card">
            <el-tab-pane label="基本信息" name="base"></el-tab-pane>
            <el-tab-pane label="人脸信息" name="face"></el-tab-pane>
          </el-tabs>
          <div v-show="activeTabName=='base'">
            <el-row :gutter="20">
              <el-col :span="12">
                  <el-form-item label="人员标识" prop="uniqueId">
                    {{form.uniqueId}}
                  </el-form-item>
              </el-col>
               <el-col :span="12">
                  <el-form-item label="姓名" prop="name">
                    {{form.name}}
              </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                  <el-form-item label="手机">
                    {{form.phone}}
                  </el-form-item>
              </el-col>
               <el-col :span="12">
                  <el-form-item label="被访人">
                    {{form.createBy}}
              </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                  <el-form-item label="创建人">
                    {{form.createBy?form.createBy:"暂无"}}
                  </el-form-item>
              </el-col>
               <el-col :span="12">
                  <el-form-item label="创建时间">
                    {{form.createTime?form.createTime:"暂无"}}
              </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                  <el-form-item label="修改人">
                    {{form.updateBy?form.updateBy:"暂无"}}
                  </el-form-item>
              </el-col>
               <el-col :span="12">
                  <el-form-item label="修改时间">
                    {{form.updateTime?form.updateTime:"暂无"}}
              </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                  <el-form-item label="备注">
                    {{form.remark?form.remark:"暂无"}}
                  </el-form-item>
              </el-col>
            </el-row>
          </div>
          <div v-show="activeTabName=='face'">
            <div class="emply" v-if="emply">
              暂无图片信息
            </div>
           <img v-else :src="'data:image/png;base64,'+faceImage" alt="" style="width:400px;height:340px">
          </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { listVisitor,listByUidOrName,deleteVisitor,visitorDetail,qrCodeGen,downloadQrCode  } from "@/api/basedata/visitor";
import { genQrCode } from "@/api/tool/qrcode";
export default {
  data() {
    return {
      // 判断图片是否为空
      emply:false,
      activeTabName:"base",
      // 详情控制
      open:false,
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
      form:{},
      // 人脸展示图片
      faceImage:null,
      // 二维码
      qrCodeImage:null
    };
  },
  created() {
    this.getDicts("visitor_effective_status").then(response => {
      this.visitorOptions = response.data;
    });
    this.getList();
    this.createCode();
  },
  methods: {
      /** 二维码生成 */
      createCode() {
         qrCodeGen().then(res=> {
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
      listVisitor(this.queryParams).then(response => {
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
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id;
      this.$confirm('是否确认删除访客姓名为"' + row.name + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return deleteVisitor(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 下载二维码 */
    download() {
      // downloadQrCode();
      let imgData = "data:image/jpg;base64," + this.erweima;
      this.downloadFile('访客二维码.png', imgData);
    },
    /** 详情 */
    handleShowDetail(row) {
      this.open = true;
      visitorDetail(row.id).then(res=> {
        this.form = res.data
         if(!res.data.facePutInfo || !res.data.facePutInfo.imageBase64) {
          this.emply = true;
          this.faceImage = null;
          return;
        }
        this.emply = false;
        this.faceImage = res.data.facePutInfo.imageBase64;
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
