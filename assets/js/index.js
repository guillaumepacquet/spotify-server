import Vue from 'vue';
import Vuetify from 'vuetify';
import 'babel-polyfill';
import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);

import app from 'app/app.vue';
import router from "./router";

new Vue({
  el: '#app',
  router,
  render: h => h(app)
})
