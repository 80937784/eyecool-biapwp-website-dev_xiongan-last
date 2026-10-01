import { constantRoutes } from '@/router'
import { getRouters } from '@/api/menu'
import Layout from '@/layout/index'
/**
 * 通过传入的当前路由对象过滤出父级路由
 * 主要用于区分tab栏和sidebar的动态展示
 */
let arr = [];
function getRoutes(routes,route) {
  if(!route) {
    return
  }
 routes.forEach(item=> {
      if(route && route.meta && route.meta.tabMenu && item.meta && item.meta.fullPath == route.meta.fullPath && route.name == item.name && !arr.length){
        arr = routes;
        return;
      }
      if(!arr.length && item.children) getRoutes(item.children,route)
  }) 
}

const permission = {
  state: {
    routes: [],
    addRoutes: [],
    oldRoutes:[]
  },

  mutations: {
    /**
     * 通过传入的当前路由对象过滤出父级路由
     * 主要用于区分tab栏和sidebar的动态展示
     */ 
    GETROUTE:(state,route)=> {
      getRoutes(state.addRoutes,route);    
      state.oldRoutes = arr.filter(item=>item.menuPosition == 'TAB');
      arr = [];  
    },
    SET_ROUTES: (state, routes) => {
      state.addRoutes = routes
      state.routes = constantRoutes.concat(routes)
      console.log(state.routes);
    },
  },
  actions: {
    // 生成路由
    GenerateRoutes({ commit }) {
      return new Promise(resolve => {
        // 向后端请求路由数据
        getRouters().then(res => {
          const accessedRoutes = filterAsyncRouter(res.data)
          accessedRoutes.push({ path: '*', redirect: '/404', hidden: true })
          commit('SET_ROUTES', accessedRoutes)
          resolve(accessedRoutes)
        })
      })
    }
  }
}

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap) {
  // console.log(asyncRouterMap);
  return asyncRouterMap.filter(route => {
    
    if (route.component) {
      // Layout组件特殊处理
      if (route.component === 'Layout') {
        route.component = Layout
      } else {
        route.component = loadView(route.component)
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children)
    }
    return true
  })
}

export const loadView = (view) => { // 路由懒加载
  return (resolve) =>  require([`@/views/${view}`], resolve)
}

export default permission
