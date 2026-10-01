<template>
  <div class="ec-iris-matchn">
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
          <el-form-item label="比对阈值" prop="searchNThreshold">
            <el-input v-model="form.searchNThreshold" placeholder="比对阈值" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="图像信息" prop="sceneImage">
        <el-tabs v-model="collectType" tab-position="top" type="card">
          <el-tab-pane label="图像上传" name="localfile">
          </el-tab-pane>
          <el-tab-pane label="图像采集" name="collect">
          </el-tab-pane>
        </el-tabs>
        <upload-file v-if="collectType == 'localfile'" v-model="form.sceneImage" accept=".bmp" tip="只能上传bmp文件，且不超过1M" />
        <iris-collect v-if="collectType == 'collect'" :isTemplateImg="false" v-model="bioData"></iris-collect>
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
        <el-table-column label="底库照" align="center" prop="irisImg">
          <template slot-scope="scope">
            <img :src="'data:jpg;base64,' + scope.row.irisImg" :width="200" :height="120" />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import { irisMatchN } from "@/api/webtrade/iristrade";
import UploadFile from '@/components/UploadFile';
import IrisCollect from "@/components/BioCollect/iris";
export default {
  components: {
    UploadFile,
    IrisCollect,
  },
  data () {
    return {
      // 表单
      form: {
        channelCode: null,
        subTreasury: null,
        searchNThreshold: null,
        sceneImage: null,
        sceneFeature: null,
        topN: 5
      },
      // 校验规则
      rules: {
        channelCode: [{ required: true, message: '场景编码不能为空', trigger: 'blur' }],
        sceneImage: [{ required: true, message: '现场照不能为空', trigger: 'change' }]
      },
      // 采集方式
      collectType: 'localfile',
      // loading提示
      loading: false,
      // 比对结果
      resultList: [],
      // 图像生物信息
      bioData: {
        imageBase64: null,
        feature: null,
      },
    }
  },
  watch: {
    bioData: {
      handler (val, oldVal) {
        this.form.sceneImage = val.imageBase64
        this.form.sceneFeature = val.feature
      },
      deep: true
    }
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
        irisMatchN(this.form).then(res => {
          this.loading = false;
          this.resultList = res.data
        }).catch(err => {
          this.loading = false;
        })
      });
    },
    // 重置表单
    resetFileForm () {
      this.form = {
        channelCode: null,
        subTreasury: null,
        searchNThreshold: null,
        sceneImage: null,
        sceneFeature: null,
        topN: 5
      }
      this.bioData = {
        imgBase64: null,
        feature: null
      }
      this.resultList = []
      this.collectType = 'localfile';
      this.resetForm("form");
    },
  }
}
</script>
<style lang="scss" scoped>
.ec-iris-matchn {
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