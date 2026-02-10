import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../supabase'

export const useUserStore = defineStore('user', () => {
    // State
    const session = ref(null)
    const profile = ref(null)
    const loading = ref(true)

    // Getters
    const isLoggedIn = computed(() => !!session.value)
    const isAdmin = computed(() => profile.value?.role === 'admin')
    const userEmail = computed(() => session.value?.user?.email || '')
    const nickname = computed(() => profile.value?.nickname || userEmail.value.split('@')[0])

    // Actions

    /**
     * 获取用户 profile（含角色信息）
     */
    async function fetchProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('Failed to fetch profile:', error)
            profile.value = null
            return
        }
        profile.value = data
    }

    /**
     * 初始化：获取当前 session 并监听变化
     */
    async function init() {
        loading.value = true

        // 获取当前 session
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        session.value = currentSession

        if (currentSession?.user) {
            await fetchProfile(currentSession.user.id)
        }

        // 监听 auth 状态变化
        supabase.auth.onAuthStateChange(async (event, newSession) => {
            session.value = newSession
            if (newSession?.user) {
                await fetchProfile(newSession.user.id)
            } else {
                profile.value = null
            }
        })

        loading.value = false
    }

    /**
     * 登录
     */
    async function login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) throw error
        return data
    }

    /**
     * 注册
     */
    async function register(email, password) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })
        if (error) throw error
        return data
    }

    /**
     * 登出
     */
    async function logout() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        session.value = null
        profile.value = null
    }

    return {
        session,
        profile,
        loading,
        isLoggedIn,
        isAdmin,
        userEmail,
        nickname,
        init,
        login,
        register,
        logout,
    }
})
