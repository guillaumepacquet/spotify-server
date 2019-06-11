import Vue from 'vue';
import VueRouter from 'vue-router';

import login from 'app/components/login-page.vue';

Vue.use(VueRouter);

const routes = [
    {path: '/login', component: login, name: 'home'}
];

const router = new VueRouter({
    routes,
    mode: 'history'
});

export default router;
