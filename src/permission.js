import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/auth-redirect', '/bind', '/register', '/mp/bindPhone','/biological','/passwordchange','/passwordforget']

router.beforeEach((to, from, next) => {
  NProgress.start()
  if (getToken()) {
    /* has token*/
    if (to.path === '/login') {
      let sso_from = to.query && to.query.sso_from;
      let redirect = to.query && to.query.redirect;
      let redirect_type = to.query && to.query.redirect_type
      if(sso_from === 'logout'){
        store.dispatch('FedLogOut').then(() => {
          next(to.fullPath.replace("&sso_from=logout","").replace("?sso_from=logout&","?"))
        })
      } else {
        next({ path: '/' })
      }
      NProgress.done()
    } else {
      if (store.getters.roles.length === 0) {
        // 判断当前用户是否已拉取完user_info信息
        store.dispatch('GetInfo').then(res => {
          // 拉取user_info
          const roles = res.roles
          store.dispatch('GenerateRoutes', { roles }).then(accessRoutes => {
          // 测试 默认静态页面
          // store.dispatch('permission/generateRoutes', { roles }).then(accessRoutes => {
            // 根据roles权限生成可访问的路由表
            router.addRoutes(accessRoutes) // 动态添加可访问路由表
            next({ ...to, replace: true }) // hack方法 确保addRoutes已完成
          })
        })
          .catch(err => {
            store.dispatch('FedLogOut').then(() => {
              Message.error(err)
              next({ path: '/' })
            })
          })
      } else {
        if(to.path == '/basedata/person') {
          next('/basedata/person/personinfo');
          return;
        }
        if(to.path == '/basedata/visitor') {
          next('/basedata/visitor/visitorinfo');
          return;
        }
        next()
        // 没有动态改变权限的需求可直接next() 删除下方权限判断 ↓
        // if (hasPermission(store.getters.roles, to.meta.roles)) {
        //   next()
        // } else {
        //   next({ path: '/401', replace: true, query: { noGoBack: true }})
        // }
        // 可删 ↑
      }
    }
  } else {
    // 没有token
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页
      NProgress.done()
    }
  }
})
let obj;
function hasRoute(routers,path) {  
  routers.forEach((item)=> {
      if(item.meta && item.meta.fullPath == path) {
        obj = item;
        return
      }
      if(!obj && item.children) hasRoute(item.children,path)
    })
}
router.afterEach((to) => {
  let path = to.fullPath;
  let routers = store.state.permission.addRoutes;
  hasRoute(routers,path);
  store.commit('GETROUTE', obj);
  obj = null;
  NProgress.done()
})

