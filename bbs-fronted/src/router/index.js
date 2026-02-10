import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/HomeView.vue'),
        meta: { title: '首页' },
    },
    {
        path: '/post/:slug',
        name: 'Post',
        component: () => import('../views/PostView.vue'),
        meta: { title: '文章详情' },
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/LoginView.vue'),
        meta: { title: '登录', guestOnly: true },
    },
    {
        path: '/admin',
        name: 'AdminDashboard',
        component: () => import('../views/admin/DashboardView.vue'),
        meta: { title: '管理后台', requiresAdmin: true },
    },
    {
        path: '/admin/editor',
        name: 'AdminEditorNew',
        component: () => import('../views/admin/EditorView.vue'),
        meta: { title: '新建文章', requiresAdmin: true },
    },
    {
        path: '/admin/editor/:id',
        name: 'AdminEditorEdit',
        component: () => import('../views/admin/EditorView.vue'),
        meta: { title: '编辑文章', requiresAdmin: true },
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { top: 0 }
    },
})

// 导航守卫
router.beforeEach(async (to) => {
    const userStore = useUserStore()

    // 等待初始化完成
    if (userStore.loading) {
        await new Promise((resolve) => {
            const unwatch = userStore.$subscribe((mutation, state) => {
                if (!state.loading) {
                    unwatch()
                    resolve()
                }
            })
        })
    }

    // 设置页面标题
    document.title = to.meta.title ? `${to.meta.title} - 我的博客` : '我的博客'

    // 需要管理员权限
    if (to.meta.requiresAdmin) {
        if (!userStore.isLoggedIn) {
            return { name: 'Login', query: { redirect: to.fullPath } }
        }
        if (!userStore.isAdmin) {
            return { name: 'Home' }
        }
    }

    // 仅游客页面（已登录用户不可访问）
    if (to.meta.guestOnly && userStore.isLoggedIn) {
        return { name: 'Home' }
    }
})

export default router
