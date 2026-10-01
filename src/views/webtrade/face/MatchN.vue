<template>
  <div class="ec-face-matchn">
    <el-form ref="form" :model="form" :rules="rules" class="ec-match-form" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="场景编码" prop="channelCode">
            <el-input v-model="form.channelCode" placeholder="场景编码" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="子场景编码" prop="subTreasury">
            <el-input v-model="form.subTreasury" placeholder="子场景编码" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="是否检活" prop="liveDetection">
            <el-select v-model="form.liveDetection" placeholder="请选择" class="ec-form-select">
              <el-option v-for="dict in yesOrNoOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="检活阈值" prop="liveDetectionThreshold">
            <el-input v-model="form.liveDetectionThreshold" placeholder="检活阈值" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="比对类型" prop="sceneMediaType">
            <el-select v-model="form.sceneMediaType" placeholder="请选择" class="ec-form-select" @change="handleSceneMediaTypeChange">
              <el-option label="照片" value="1"></el-option>
              <el-option label="视频" value="2"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="比对阈值" prop="searchNThreshold">
            <el-input v-model="form.searchNThreshold" placeholder="比对阈值" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="图像(视频)" prop="sceneImage">
        <el-tabs v-model="collectType" tab-position="top" type="card">
          <el-tab-pane label="图像上传" name="localfile">
          </el-tab-pane>
          <el-tab-pane label="图像采集" name="collect" v-if="form.sceneMediaType == '1'">
          </el-tab-pane>
        </el-tabs>
        <upload-file ref="uploadFile" :imgFile="form.sceneMediaType == '1'" :uploadPath="uploadUrl" :attachData="attachData" :showFailInfo="false" v-if="collectType == 'localfile'" v-model="form.sceneImage" :accept="form.sceneMediaType == '1'? '.jpg,.jpeg,.png':'.mp4'" :tip="form.sceneMediaType == '1'? '只能上传jpg/png文件，且不超过5M' : '只能上传mp4文件，且不超过10M' " @success="handleUploadFileSuccess" @fail="handleUploadFileFail" :drag="form.sceneMediaType=='2'" />
        <face-collect v-if="collectType == 'collect' && form.sceneMediaType == '1'" v-model="form.sceneImage"></face-collect>
      </el-form-item>
      <div class="ec-form-btn" v-loading="loading">
        <el-button type="primary" @click="submitFileForm">提交比对</el-button>
        <el-button @click="resetFileForm">重置表单</el-button>
      </div>
    </el-form>

    <div class="ec-match-result">
      <el-table :data="resultList" border>
        <el-table-column label="唯一标识" align="center" prop="uniqueId" />
        <el-table-column label="比对得分" align="center" prop="score" />
        <!-- 后端未返回检活结果，暂时不渲染-->
        <template v-if="false">
          <el-table-column label="检活结果" align="center" prop="liveDetectionResult">
            <template slot-scope="scope">
              <span>{{scope.row.liveDetectionResult == '0' ? '通过' : '未通过'}}</span>
            </template>
          </el-table-column>
          <el-table-column label="检活得分" align="center" prop="liveDetectionScore" />
        </template>
        <el-table-column label="底库照" align="center" prop="faceImg">
          <template slot-scope="scope">
            <img :src="'data:jpg;base64,' + scope.row.faceImg" :width="120" :height="160" />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import { faceMatchN } from "@/api/webtrade/facetrade";
import UploadFile from '@/components/UploadFile';
import FaceCollect from "@/components/BioCollect/face";
export default {
  components: {
    UploadFile,
    FaceCollect,
  },
  data() {
    return {
      // 表单
      form: {
        channelCode: null,
        subTreasury: null,
        liveDetection: 'Y',
        liveDetectionThreshold: null,
        sceneMediaType: '1',
        searchNThreshold: null,
        sceneImage: null,
        topN: 5
      },
      // 校验规则
      rules: {
        channelCode: [{ required: true, message: '场景编码不能为空', trigger: 'blur' }],
        liveDetection: [{ required: true, message: '是否检活不能为空', trigger: 'change' }],
        sceneMediaType: [{ required: true, message: '媒体类型不能为空', trigger: 'change' }],
        sceneImage: [{ required: true, message: '现场照不能为空', trigger: 'change' }]
      },
      // 采集方式
      collectType: 'localfile',
      // 是否字典
      yesOrNoOptions: null,
      // loading提示
      loading: false,
      // 比对结果
      resultList: []
    }
  },
  computed: {
    uploadUrl() {
      if (this.form.sceneMediaType == '1') {
        return null;
      }
      return '/webtrade/face/matchn/file';
    },
    attachData() {
      if (this.form.sceneMediaType == '1') {
        return null;
      }
      let data = {}
      Object.keys(this.form).forEach((key) => {
        if (this.form[key]) {
          data[key] = this.form[key]
        }
      })
      return data;
    }
  },
  created() {
    this.getDicts("sys_yes_no").then(response => {
      this.yesOrNoOptions = response.data;
    });
  },
  methods: {
    // 提交表单
    submitFileForm() {
      this.loading = true
      this.resultList = []
      this.$refs["form"].validate(valid => {
        if (!valid) {
          this.loading = false;
          return;
        }
        if (this.form.sceneMediaType == '2') {
          this.$refs.uploadFile.submit();
          return;
        }
        // 比对接口调用
        faceMatchN(this.form).then(res => {
          this.loading = false;
          this.resultList = res.data
        }).catch(err => {
          this.loading = false;
        })
      });
    },
    // 重置表单
    resetFileForm() {
      this.$refs.uploadFile&&this.$refs.uploadFile.cancel();
      this.loading = false;
      this.form = {
        channelCode: null,
        subTreasury: null,
        liveDetection: 'Y',
        liveDetectionThreshold: null,
        sceneMediaType: '1',
        searchNThreshold: null,
        sceneImage: null,
        topN: 5
      }
      this.resultList = []
      this.collectType = 'localfile';
      this.resetForm("form");
    },
    // 比对类型改变事件
    handleSceneMediaTypeChange(val) {
      this.$refs.uploadFile.cancel();
      if (val == '2') {
        this.collectType = 'localfile'
      }
    },
    /**文件上传成功处理 */
    handleUploadFileSuccess(res) {
      this.loading = false;
      this.resultList = res.data
      this.$refs.uploadFile.cancel();
    },
    /**文件上传失败 */
    handleUploadFileFail(res) {
      this.loading = false;
      this.$message.error(res.msg)
    }
  }
}
</script>
<style lang="scss" scoped>
.ec-face-matchn {
  margin: 20px 30px;
  .ec-match-form {
    padding: 20px;
    margin-bottom: 20px;
    border: 1px solid #eee;
    .ec-form-btn {
      text-align: center;
    }
  }
}
</style>