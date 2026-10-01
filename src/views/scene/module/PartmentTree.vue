<template>
  <div class="boxs">
    <el-input placeholder="请输入内容" size="small" v-model="filterText">
      <i slot="suffix" class="el-input__icon el-icon-search"></i>
    </el-input>
    <el-tree
      v-loading="loading"
      class="filter-tree"
      @node-click="nodeChange"
      :data="data"
      :props="defaultProps"
      :default-expanded-keys="defaultShowNodes"
      node-key="id"
      :filter-node-method="filterNode"
      ref="tree"
    >
    </el-tree>
  </div>
</template>
<script>
import {searchList} from '@/api/scene/addscene.js';
export default {
    watch: {
      // 过滤监控
      filterText(val) {
          this.$refs.tree.filter(val);
      }
    },
    methods: {
      filterNode(value, data) {
          if (!value) return true;
          return data.sceneName.indexOf(value) !== -1;
      },
      /** 查询场景信息列表 */
      getList() {
        this.loading = true;
          searchList().then(response => {
            this.data = [{sceneName:"场景名称",children:response.data}] ;
            this.data.forEach(item=>this.defaultShowNodes.push(item.id));
            this.loading = false;
        });
      },
      /** 节点被选中 */
      nodeChange(val) {
        this.$emit('treeChangeTable',val);
      }
    },
    created () {
      this.getList();
    },
    data() {
      return {
        // 过滤搜索框内容
        filterText: '',    
        // 默认展示树状节点
        defaultShowNodes:[],
        loading:false,
        data: [],         // 树状结构数据
        defaultProps: {   // 树状结构参数
          children: 'children',
          label: 'sceneName'
        }
      };
    }
}
</script>
<style lang="scss" scoped>
.boxs {
  padding: 10px;
  border: 1px solid rgb(224, 224, 224);
  border-radius: 3px;
  height: 90vh;
  overflow-x: auto;
}
/deep/ .el-tree-node {
  margin-top: 10px;
}
</style>
