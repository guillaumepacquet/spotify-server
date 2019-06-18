import Vue from 'vue';
import VueRouter from 'vue-router';

import login from 'app/components/login-page.vue';
import register from 'app/components/register-page.vue';
import home from 'app/components/home-page.vue';

Vue.use(VueRouter);

const routes = [
    {path: '/', component: home, name: 'home', meta: { requiresAuth: true } },
    {path: '/register', component: register, name: 'register', meta: { guest: true } },
    {path: '/login', component: login, name: 'login', meta: { guest: true } },
];

const router = new VueRouter({
    routes,
    mode: 'history'
});

router.beforeEach((to, from, next) => {
    if(to.matched.some(record => record.meta.requiresAuth)) {
        if (localStorage.getItem('jwt') == null) {
            next({
                path: '/login',
                params: { nextUrl: to.fullPath }
            })
        } else {
            next();
        }
    } else {
        next()
    }
})

export default router;
