import { login, logout, getInfo } from '@/api/login'
const user = {
  state: {
    token: JSON.parse(localStorage.getItem('token')),
    name: JSON.parse(localStorage.getItem('name')),
    roles: JSON.parse(localStorage.getItem('roles'))
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      localStorage.setItem("token", JSON.stringify(token));
      state.token = token;
    },
    SET_NAME: (state, name) => {
      localStorage.setItem("name", JSON.stringify(name));
      state.name = name;
    },
    SET_ROLES: (state, roles) => {
      localStorage.setItem("roles", JSON.stringify(roles));
      state.roles = roles;
    },
  },

  actions: {
    // 登录
    Login({ commit }, data) {
      return new Promise((resolve, reject) => {
        login(data.username, data.password).then(response => {
          if (response.data.statusCode === 200) {
            console.log("?");
            const data = response.data
            const tokenStr = data.data.token
            commit('SET_TOKEN', tokenStr)
            resolve()
          } else {
            reject(response.data)
          }
        }).catch(error => {
          reject(error)
        })

      });
    },
    // 登出
    LogOut({ commit }) {
      return new Promise((resolve, reject) => {
        commit("SET_TOKEN", "");
        commit("SET_ROLES", []);
        resolve();
      });
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise((resolve) => {
        commit("SET_TOKEN", "");
        resolve();
      });
    },
    GetUserInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        console.log(state.name)
        if (state.token.includes("admin")) {
          commit("SET_ROLES", ["admin"]);
        } else {
          commit("SET_ROLES", ["edit"]);
        }
        resolve(state);
      });
    },
  },
};

export default user;
