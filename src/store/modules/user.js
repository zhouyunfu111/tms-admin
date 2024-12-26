import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import storage from '@/utils/storage';
import { getOrgsList } from '@/api/system/user'

const user = {
  state: {
    token: getToken(),
    id: '',
    name: '',
    avatar: '',
    roles: [],
    permissions: [],
    organizingInfo: storage.getItem('organizingInfo') || {},
    organizingList: storage.getItem('organizingList') || [],
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_ID: (state, id) => {
      state.id = id
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_PERMISSIONS: (state, permissions) => {
      state.permissions = permissions
    },
    SET_ORGANIZING_INFO: (state, info) => {
      state.organizingInfo = info || {};
      storage.setItem('organizingInfo', info);
    },
    SET_ORGANIZING_LIST: (state, list) => {
      state.organizingList = list;
      storage.setItem('organizingList', list);
    }
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      const username = userInfo.username.trim()
      const password = userInfo.password
      const code = userInfo.code
      const uuid = userInfo.uuid
      return new Promise((resolve, reject) => {
        login(username, password, code, uuid).then(res => {
          setToken(res.token)
          commit('SET_TOKEN', res.token)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getInfo().then(res => {
          try {
            const user = res.user
            const avatar = (user.avatar == "" || user.avatar == null) ? require("@/assets/images/profile.jpg") : process.env.VUE_APP_BASE_API + user.avatar;
            if (res.roles && res.roles.length > 0) { // 验证返回的roles是否是一个非空数组
              commit('SET_ROLES', res.roles)
              commit('SET_PERMISSIONS', res.permissions)
            } else {
              commit('SET_ROLES', ['ROLE_DEFAULT'])
            }
            console.log(state.organizingList)
            const info = state.organizingList.find((item) => item.id === res?.currentOrg || '') || state.organizingList[0];
            commit('SET_ORGANIZING_INFO', info);
            commit('SET_ID', user.userId)
            commit('SET_NAME', user.userName)
            commit('SET_AVATAR', avatar)
            resolve(res)
          } catch(e) {
            console.log(e)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 退出系统
    LogOut({ commit, state,dispatch }) {
      return new Promise(async (resolve, reject) => {
        try {
          await logout(state.token)
          dispatch('ClearCacheData')
          resolve()
        } catch(e) {
          reject(e)
        }
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        resolve()
      })
    },
    // 获取组织列表
    getOrgList ({ commit }) {
      return new Promise(async (resolve, reject) => {
        try {
          const { rows } = await getOrgsList()
          commit('SET_ORGANIZING_LIST', rows || [])
          resolve(rows);
        } catch (error) {
          reject(error);
          console.log(error)
        }
      });
    },
    // 设置组织信息
    setOrgInfo ({ commit }, info) {
      return new Promise((resolve) => {
        commit('SET_ORGANIZING_INFO', info);
        resolve();
      });
    },
    ClearCacheData ({
      commit,
      state
    }) {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      commit('SET_PERMISSIONS', [])
      removeToken()
      storage.clear()
    }
  }
}

export default user
