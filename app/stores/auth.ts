import {defineStore} from 'pinia'
import type {User} from '~~/types/user'

type RequestError = {
  statusCode?: number
  status?: number
  data?: {message?: string}
  message?: string
}

function asRequestError(error: unknown): RequestError {
  return typeof error === 'object' && error !== null ? error as RequestError : {}
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isReady = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthed = computed(() => !!user.value)

  async function fetchMe() {
    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

      user.value = await $fetch<User>('/api/auth/me', {
        credentials: 'include',
        headers,
      })
    } catch (e: unknown) {
      const error = asRequestError(e)
      user.value = null
      if (error.statusCode !== 401 && error.status !== 401) throw e
    }
  }

  async function init() {
    if (isReady.value) return
    isLoading.value = true
    error.value = null
    try {
      await fetchMe()
    } finally {
      isLoading.value = false
      isReady.value = true
    }
  }

  async function signIn(payload: { email: string; password: string }) {
    isLoading.value = true
    error.value = null
    try {
      await $fetch('/api/auth/login', {
        method: 'POST',
        body: payload,
        credentials: 'include',
      })

      await fetchMe()
    } catch (e: unknown) {
      const requestError = asRequestError(e)
      error.value = requestError.data?.message ?? requestError.message ?? $t('error.auth.signIn')
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function signUp(payload: { name: string; email: string; password: string; gender: string }) {
    isLoading.value = true
    error.value = null
    try {
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: payload,
        credentials: 'include',
      })
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    user.value = null
    await $fetch('/api/auth/logout', {method: 'POST', credentials: 'include'})
  }

  return {
    user,
    isAuthed,
    isReady,
    isLoading,
    error,
    init,
    fetchMe,
    signIn,
    signUp,
    logout,
  }
})
