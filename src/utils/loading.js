import { Loading } from 'element-ui';
const hasLoading = {
    loading:null,
    start:function() {
       this.loading = Loading.service({
            background:'rgba(0, 0, 0, 0.8)',
            text:'正在导出，请稍等'
        })
    },
    end:function() {
        this.loading.close();
    }
}

export default hasLoading;