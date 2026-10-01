<template>
  <div class="ec-face-comparetwo">
    <el-form ref="form" :model="form" :rules="rules" class="ec-match-form" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="比对阈值" prop="threshold">
            <el-input v-model="form.threshold" placeholder="比对阈值" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="图像1" prop="image1Base64">
            <upload-file v-model="form.image1Base64" accept=".jpg,.jpeg,.png" tip="只能上传jpg/png文件，且不超过5M" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="图像2" prop="image2Base64">
            <upload-file v-model="form.image2Base64" accept=".jpg,.jpeg,.png" tip="只能上传jpg/png文件，且不超过5M" />
          </el-form-item>
        </el-col>
      </el-row>
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
      </el-table>
    </div>
  </div>
</template>
<script>
import { faceComparetwo } from "@/api/webtrade/facetrade";
import UploadFile from '@/components/UploadFile';
export default {
  components: {
    UploadFile
  },
  data() {
    return {
      // 表单
      form: {
        threshold: null,
        image1Base64: null,
        image2Base64: null
      },
      // 校验规则
      rules: {
        image1Base64: [{ required: true, message: '比对图片不能为空', trigger: 'blur' }],
        image2Base64: [{ required: true, message: '比对图片不能为空', trigger: 'blur' }],
      },
      // loading提示
      loading: false,
      // 比对结果
      resultList: []
    }
  },
  created() {
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
        // 比对接口调用
        faceComparetwo(this.form).then(res => {
          this.loading = false;
          this.resultList = [res.data]
        }).catch(err => {
          this.loading = false;
        })
      });
    },
    // 重置表单
    resetFileForm() {
      this.form = {
        threshold: null,
        image1Base64: null,
        image2Base64: null
      }
      this.resultList = []
      this.resetForm("form");
    }
  }
}
</script>
<style lang="scss" scoped>
.ec-face-comparetwo {
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