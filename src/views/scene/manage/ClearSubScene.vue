<template>
    <!-- 清空子场景数据对话框 -->
    <el-dialog title="清空子场景" :visible.sync="clearSubDataForm.open" width="600px" append-to-body :close-on-click-modal="false">
      <el-form ref="clearSubDataForm" :model="clearSubDataForm" label-width="80px">
        <el-form-item label="子场景" prop="subtreasuryIds" :rules="[{required: true, message:'子场景不能为空',trigger:'change'}]">
          <el-cascader v-model="clearSubDataForm.subtreasuryIds" :props="clearSubProps" :show-all-levels="false" clearable filterable class="ec-form-select"></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitClearSubData">确 定</el-button>
        <el-button @click="clearSubDataForm.open=false;clearSubDataForm.subtreasuryIds=null">取 消</el-button>
      </div>
    </el-dialog>
</template>
<script>
import { clearSubData,listAllChannel,listByChannel } from '@/api/scene/addscene.js';
export default {
    data () {
        return {
             clearSubDataForm: {
                // 清空子场景弹窗是否打开
                open: false,
                // 需要清空数据的子场景主键
                subtreasuryIds: null
            },
            // 子场景级联查询属性配置
            subProps: {
                emitPath: false,
                lazy: true,
                lazyLoad(node, resolve) {
                    console.log(node);
                const { level, value } = node;
                if (level == 0) {
                    listAllChannel().then(response => {
                    if (response.data && response.data.length) {
                        const nodes = response.data.map(item => ({
                        value: item.id,
                        label: item.channelName,
                        leaf: false
                        }));
                        resolve(nodes);
                    }
                    })
                } else {
                    listByChannel(value).then(response => {
                    if (response.data && response.data.length) {
                        const nodes = response.data.map(item => ({
                        value: item.id,
                        label: item.subTreasuryName,
                        leaf: true
                        }));
                        // 通过调用resolve将子节点数据返回，通知组件数据加载完成
                        resolve(nodes);
                    }else {
                         resolve();
                    }
                    });
                }
                }
            },
        }
    },
    computed: {
        // 清空子场景数据操作--子场景级联查询属性配置
        clearSubProps() {
            return Object.assign({}, this.subProps, { multiple: true })
        }
    },
    methods: {
        /**提交清空子场景 */
        submitClearSubData() {
            this.$refs["clearSubDataForm"].validate(valid => {
                if (!valid) {
                return
                }
                const subIds = this.clearSubDataForm.subtreasuryIds.join();
                clearSubData(subIds).then(response => {
                this.clearSubDataForm.open = false;
                this.msgSuccess("清除成功");
                })
            });
        },
         /** 打开清空子场景 */
        handleClearSubData() {
            this.clearSubDataForm.open = true;
        },
    }
}
</script>