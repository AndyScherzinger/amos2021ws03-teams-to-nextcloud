//store/modules/auth.js

import axios from 'axios';

const state = {
    user: null,
};

const getters = {
    isAuthenticated: state => !!state.user,    
    StatePosts: state => state.posts,
    StateUser: state => state.user,
};

const actions = {

    async initLogin({dispatch}) {
        const response = await axios.post('index.php/login/v2');
        console.log("initLogin: ", response);
        dispatch('openDefaultBrowser', response);
        dispatch('pollEndpoint', response);
    },
    
    async openDefaultBrowser(_, strUrl) {
        window.nw.Shell.openExternal(strUrl);
    },

    async pollEndpoint(_, endpoint, strToken) {
        try {
            const response = await axios.post(endpoint, {token: strToken});
            console.log("pollEndpoint: ", response);
            // Check resposne

        } catch(e) {
            console.error(e);
        }
        setTimeout(this.pollEndpoint, 1000);
    },

    async logout({commit}){
        let user = null;
        commit('logout', user);
    }
      
};

const mutations = {
    setUser(state, username) {
        state.user = username;
    },

    logout(state){
        state.user = null;
    },
};

export default {
  state,
  getters,
  actions,
  mutations
};
