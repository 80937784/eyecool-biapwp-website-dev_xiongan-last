<template>
    <div class="app-container">
        <el-row>
        <!-- 树形结构 -->
        <el-col :span="4" :xs="24">
           <PartmentTree @treeChangeTable="treeChangeTable" ref="tree"></PartmentTree>
        </el-col>
        <el-col :span="20" style="padding-left:10px;" :xs="24">
            <!-- 顶部搜索 -->
            <header>
                <div class="search">
                    <span>场景名称：</span>
                    <el-input v-model="queryParams.channelName" @keyup.enter.native="handleQuery" size="small" placeholder="请输入内容"></el-input>
                </div>
                <div class="button">
                    <el-button size="small" @click="handleQuery" icon="el-icon-search" v-hasPermi="['scene:channel:query']" type="primary">查询</el-button>
                    <el-button size="small" icon="el-icon-refresh" @click="reset" type="warning">重置</el-button>
                </div>
            </header>
            <!-- 树形结构添加删除 -->
            <el-row>
            <el-col style="margin-top:20px" :gutter="10" :span="24">
               <el-button size="mini" icon="el-icon-plus" type="success" v-hasPermi="['scene:channel:add']" @click="add">新增</el-button>
               <el-button size="mini" @click="$refs.clearsubscene.handleClearSubData()" type="info">清空子场景</el-button>
            </el-col>
            </el-row>
            <!-- 数据表格 -->
            <el-table
                :data="tableData"
                style="margin-top:10px"
                row-key="id"
                v-loading="loading"
                border
                @selection-change="handleSelectionChange"
                :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
                <el-table-column type="selection" align="center" width="55" />
                <el-table-column label="场景名称" prop="sceneName">
                    <template slot-scope="scope">
                        <el-button @click="handleShowDetail(scope.row)" type="text">{{scope.row.sceneName}}</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="场景类型" align="center" prop="channelName" >
                    <template slot-scope="scope">
                        {{scope.row.parentId?'子场景':'场景'}}
                    </template>
                 </el-table-column>
               <el-table-column label="场景编码" align="center" prop="sceneCode" />
                <el-table-column label="多模态" align="center" prop="faceIrisMode" width="110">
                    <template slot-scope="scope">
                    <span v-if="scope.row.parentId">--</span>
                    <el-switch v-else @change="handleChangeBioMode(scope.row, 'faceIrisMode')" v-model="scope.row.faceIrisMode" active-color="#13ce66" inactive-color="#ccc" active-value="1" inactive-value="0">
                    </el-switch>
                    </template>
                </el-table-column>
               <el-table-column label="人脸" align="center" prop="faceMode" width="110">
                    <template slot-scope="scope">
                    <span v-if="scope.row.parentId">--</span>
                    <el-switch v-else @change="handleChangeBioMode(scope.row, 'faceMode')" v-model="scope.row.faceMode" active-color="#13ce66" inactive-color="#ccc" active-value="1" inactive-value="0">
                    </el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="虹膜" align="center" prop="irisMode" width="110">
                    <template slot-scope="scope">
                    <span v-if="scope.row.parentId">--</span>
                    <el-switch v-else @change="handleChangeBioMode(scope.row, 'irisMode')" v-model="scope.row.irisMode" active-color="#13ce66" inactive-color="#ccc" active-value="1" inactive-value="0">
                    </el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="指纹" align="center" prop="fingerMode" width="110">
                    <template slot-scope="scope">
                    <span v-if="scope.row.parentId">--</span>
                    <el-switch v-else @change="handleChangeBioMode(scope.row, 'fingerMode')" v-model="scope.row.fingerMode" active-color="#13ce66" inactive-color="#ccc" active-value="1" inactive-value="0">
                    </el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="指静脉" align="center" prop="fveinMode" width="110">
                    <template slot-scope="scope">
                    <span v-if="scope.row.parentId">--</span>
                    <el-switch v-else @change="handleChangeBioMode(scope.row, 'fveinMode')" v-model="scope.row.fveinMode" active-color="#13ce66" inactive-color="#ccc" active-value="1" inactive-value="0">
                    </el-switch>
                    </template>
                </el-table-column>
               <el-table-column label="操作日期" align="center" prop="updateTime">
                <template slot-scope="scope">
                   {{scope.row.updateTime?scope.row.updateTime:scope.row.createTime}}
               </template>
               </el-table-column>
                <el-table-column label="操作" fixed="right" align="center" class-name="small-padding fixed-width">
                    <template slot-scope="scope">
                    <!-- <el-button size="mini" @click="add(scope.row)" type="text">添加</el-button> -->
                    <el-button size="mini" v-hasPermi="['scene:channel:edit']" @click="editForm(scope.row)" type="text">修改</el-button>
                    <el-button size="mini" v-hasPermi="['scene:channel:remove']" @click="delScene(scope.row)" style="color:#f56c6c" type="text">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-col>
        </el-row>
    <!-- 添加场景和子场景弹出层 -->
    <AddModel :type="type" :title="title" @reflash="reflash" ref="addmodel"/>
    <!-- 清空子场景 -->
    <ClearSubScene ref="clearsubscene" />
    <!-- 删除确认弹窗 -->
    <el-dialog
    title="重要提示！"
    :visible.sync="delTipsShow"
    width="400px">
    <div class="tips"><i class="el-icon-warning"></i> 数据清空后不可恢复，是否确认清空？</div>
    <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="delTipsShow = false">确认清空数据</el-button>
        <el-button @click="delTipsShow = false">取 消</el-button>
    </span>
    </el-dialog>
    </div>    
</template>
<script>
import PartmentTree from '../module/PartmentTree';
import { delChannel, searchList, updateChannel } from "@/api/scene/channel";
import { delSubtreasury } from "@/api/scene/subtreasury";
import {getSceneCode} from '@/api/scene/addscene.js';
import AddModel from './AddModel.vue';
import ClearSubScene from './ClearSubScene.vue';
export default {
    components: {
        PartmentTree,
        AddModel,
        ClearSubScene
    },
    mounted () {
        this.getList();
    },
    data () {
        return {
            // 多选框数据
            multipleSelection:"", 
            // 场景名称查询
            search:"",  
            // 加载状态
            loading:false,
            // 查询参数
            queryParams: {
                channelCode: null,
                channelName: null,
                tenantId: null,
                id:null
            },
            // 表格数据
            tableData: [],
            // 确认删除弹窗
            delTipsShow:false,
            // 判断场景还是子场景的类型字段
            type:'1',
            // 弹出层的名称
            title:"新增"
        }
    },
     methods: {
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },
        // 搜索框查询
        handleQuery() {
            this.getList();
        },
        // 重置
        reset() {
            this.queryParams.channelName = "";
            this.getList();
        },
        /** 展示详情 */
        handleShowDetail(row) {
            this.title = "场景详情";
            /** 根据是否有parentId来判断是场景还是子场景，并且调用相应组件的查看方法 */
            // if (row.parentId) this.$refs.submodel.handleShowDetail(row)
            // else this.$refs.model.handleShowDetail(row)
            if(row.parentId) {
                this.$refs.addmodel.forms.type = '2';
                this.$refs.addmodel.modifyFormDetail(row)
            }else {
                this.$refs.addmodel.forms.type = '1';
                this.$refs.addmodel.handleUpdateDetail(row);
            }
        },
        /** 查询场景信息列表 */
        getList() {
            this.loading = true;
            searchList(this.queryParams).then(response => {
                this.tableData = response.data;
                this.loading = false;
                this.queryParams.id = null;
            });
            },
         /** 生物信息业务状态改变 */
        handleChangeBioMode(row, mode) {
        this.$confirm('是否确认修改开通状态?', "警告", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
        }).then(function () {
            return updateChannel(row);
        }).then(response => {
            this.msgSuccess("修改成功");
        }).catch(() => {
            row[mode] = row[mode] === "0" ? "1" : "0";
        });
        },
        /** 添加场景 */
        add() {
            this.title = "新增";
            this.$refs.addmodel.openModel();
        },
        /** 删除场景 */
        delScene(row) {
            if(row.parentId) {
                this.$confirm('数据清空后不可恢复，是否确认清空？', '提示！', {
                    confirmButtonText: '确 认',
                    cancelButtonText: '取 消',
                    type: 'warning'
                    }).then(() => {
                    this.handleDelete(row);
                    });         
            }else {
                if(row.children.length) {
                    this.msgError("删除失败，请先删除子场景内容")
                }else {
                    this.delChannels(row);
                }
            }
        },
        /** 删除按钮操作 */
        async handleDelete(row) {
            const data = await delSubtreasury(row.id);
            if(data.code == 200 ) {
                this.msgSuccess("删除成功");
                this.reflash();
            }else {
                 this.msgError("删除失败，错误码为" + data.code);
            }
        },
        async delChannels(row) {
            const data = await delChannel(row.id);
            if(data.code == 200 ) {
                this.msgSuccess("删除成功");
                this.reflash();
            }else {
                 this.msgError("删除失败，错误码为" + data.code);
            }
        },
        /** 修改当前场景 */
        editForm(row) {
            this.title = "修改";
            if(row.parentId) {
                this.$refs.addmodel.modifyForm(row);
               this.$refs.addmodel.forms.type = '2';
            }else {
                this.$refs.addmodel.handleUpdate(row);   
                this.$refs.addmodel.forms.type = '1';
            }
            
        },
        /** 场景添加后刷新页面 */
        reflash() {
            this.getList();
            this.$refs.tree.getList();
        },
        /** 点击树结构改变table */
        treeChangeTable(val) {
            if(val.parentId) return;
            this.queryParams.id = val.id;
            this.getList();
        }
        }
}
</script>
<style lang="scss" scoped>
header {
    display: flex;
    align-items: center;
    .search {
        display: flex;
        align-items: center;
        font-size: 14px;
        margin-left: 10px;
        span {
            width: 100px;
        }
    }
    .button {
        margin-left: 10px;
    }
}
.tips {
    text-align: center;
    color: #f56c6c;
    font-size: 15px;
}

</style>