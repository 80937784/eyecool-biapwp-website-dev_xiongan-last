<template>
  <div class="ec-faceiris-matchone">
    <el-form ref="form" :model="form" :rules="rules" class="ec-match-form" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="场景编码" prop="channelCode">
            <el-input v-model="form.channelCode" placeholder="场景编码" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="唯一标识" prop="uniqueId">
            <el-input v-model="form.uniqueId" placeholder="唯一标识" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="比对阈值" prop="compareThreshold">
            <el-input v-model="form.compareThreshold" placeholder="比对阈值" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="图像信息">
        <el-tabs v-model="collectType" tab-position="top" type="card">
          <el-tab-pane label="图像上传" name="localfile">
          </el-tab-pane>
          <el-tab-pane label="图像采集" name="collect">
          </el-tab-pane>
        </el-tabs>
        <template v-if="collectType == 'localfile'">
          <el-col :span="12">
            <el-form-item prop="faceSceneImage">
              <upload-file v-model="form.faceSceneImage" accept=".jpg,.jpeg,.png" tip="人脸图片" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="irisSceneImage">
              <upload-file v-model="form.irisSceneImage" accept=".bmp" tip="虹膜图片" />
            </el-form-item>
          </el-col>
        </template>
        <template v-else>
          <el-form-item prop="faceSceneImage">
            <face-iris-collect v-model="bioData"></face-iris-collect>
          </el-form-item>
        </template>
      </el-form-item>
      <div class="ec-form-btn" v-loading="loading">
        <el-button type="primary" @click="submitFileForm">提交比对</el-button>
        <el-button @click="resetFileForm">重置表单</el-button>
      </div>
    </el-form>

    <div class="ec-match-result">
      <el-table :data="resultList" border>
        <el-table-column label="比对结果" align="center" prop="result">
          <template slot-scope="scope">
            <span>{{scope.row.result ? '通过' : '未通过'}}</span>
          </template>
        </el-table-column>
        <el-table-column label="比对得分" align="center" prop="score" />
        <el-table-column label="人脸底库照" align="center" prop="faceImg">
          <template slot-scope="scope">
            <img :src="'data:jpg;base64,' + scope.row.faceImg" :width="120" :height="160" />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import { faceIrisMatchOne } from "@/api/webtrade/faceiristrade";
import UploadFile from '@/components/UploadFile';
import FaceIrisCollect from "@/components/BioCollect/faceiris";
export default {
  components: {
    UploadFile,
    FaceIrisCollect,
  },
  data () {
    return {
      // 表单
      form: {
        channelCode: null,
        uniqueId: null,
        compareThreshold: null,
        faceSceneImage: null,
        irisSceneImage: null,
        irisSceneFeature: null
      },
      // 校验规则
      rules: {
        channelCode: [{ required: true, message: '场景编码不能为空', trigger: 'blur' }],
        uniqueId: [{ required: true, message: '唯一标识不能为空', trigger: 'blur' }],
        irisSceneImage: [{ required: true, message: '现场照不能为空', trigger: 'change' }],
        faceSceneImage: [{ required: true, message: '现场照不能为空', trigger: 'change' }]
      },
      // 采集方式
      collectType: 'localfile',
      // loading提示
      loading: false,
      // 比对结果
      resultList: [],
      // 图像生物信息
      bioData: {
        irisImgBase64: null,
        faceImgBase64: null,
        irisFeature: null,
      },
    };
  },
  watch: {
    bioData: {
      handler (val, oldVal) {
        this.form.faceSceneImage = val.faceImgBase64
        this.form.irisSceneImage = val.irisImgBase64
        this.form.irisSceneFeature = val.irisFeature
      },
      deep: true
    },
    collectType: {
      handler (val, oldVal) {
        if (val == 'localfile') {
          this.form.irisSceneFeature = null
        }
      },
    }
  },
  created () {
  },
  methods: {
    // 提交表单
    submitFileForm () {
      this.loading = true
      this.resultList = []
      this.$refs["form"].validate(valid => {
        if (!valid) {
          this.loading = false;
          return;
        }
        // 比对接口调用
        faceIrisMatchOne(this.form).then(res => {
          this.loading = false;
          this.resultList = [res.data]
        }).catch(err => {
          this.loading = false;
        })
      });
    },
    // 重置表单
    resetFileForm () {
      this.form = {
        channelCode: null,
        uniqueId: null,
        compareThreshold: null,
        faceSceneImage: null,
        irisSceneImage: null,
        irisSceneFeature: null
      }
      this.bioData = {
        irisImgBase64: null,
        faceImgBase64: null,
        irisFeature: null,
      }
      this.resultList = []
      this.collectType = 'localfile';
      this.resetForm("form");
    },
  }
}
</script>
<style lang="scss" scoped>
.ec-faceiris-matchone {
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