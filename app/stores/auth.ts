import { defineStore } from 'pinia'
import type { User } from '~~/types/user'

interface RequestError {
  statusCode?: number
  status?: number
  data?: { message?: string }
  message?: string
}

function asRequestError(error: unknown): RequestError {
  return typeof error === 'object' && error !== null ? (error as RequestError) : {}
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

  async function login(payload: { email: string; password: string }) {
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
      error.value = requestError.data?.message ?? requestError.message ?? $t('error.auth.login')
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function signUp(payload: {
    name: string
    email: string
    password: string
    gender: string
    personalDataConsent: boolean
    userAgreementAccepted: boolean
    consentVersion: string
    agreementVersion: string
  }) {
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

  async function recoverPassword(email: string) {
    isLoading.value = true
    error.value = null
    try {
      await $fetch('/api/auth/recover-password', {
        method: 'POST',
        body: {
          email,
        },
        credentials: 'include',
      })
    } catch (request: unknown) {
      const requestError = asRequestError(request)
      const message =
        requestError.data?.message ?? requestError.message ?? $t('error.auth.recoverPassword')
      error.value = message
      console.error('Recover password error:', message)
      throw request
    } finally {
      isLoading.value = false
    }
  }

  async function verifyRecoverCode(email: string, code: string) {
    isLoading.value = true
    error.value = null
    try {
      await $fetch('/api/auth/verify-recover-code', {
        method: 'POST',
        body: {
          email,
          code,
        },
        credentials: 'include',
      })

      await navigateTo('/new-password')
    } catch (request: unknown) {
      const requestError = asRequestError(request)
      error.value =
        requestError.data?.message ?? requestError.message ?? $t('error.auth.verifyRecoverCode')
      console.error('Verify recover code error:', error.value)
      throw request
    } finally {
      isLoading.value = false
    }
  }

  async function updatePassword(newPassword: string, confirmPassword: string) {
    isLoading.value = true
    error.value = null
    try {
      await $fetch('/api/auth/reset-password', {
        method: 'PATCH',
        body: {
          password: newPassword,
          confirmPassword: confirmPassword,
        },
        credentials: 'include',
      })

      await navigateTo('/login')
    } catch (request: unknown) {
      const requestError = asRequestError(request)
      error.value =
        requestError.data?.message ?? requestError.message ?? $t('error.auth.updatePassword')
      console.error('Update password error:', error.value)
      throw request
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    user.value = null
    await $fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
  }

  return {
    user,
    isAuthed,
    isReady,
    isLoading,
    error,
    init,
    fetchMe,
    login,
    signUp,
    logout,
    recoverPassword,
    verifyRecoverCode,
    updatePassword,
  }
})
