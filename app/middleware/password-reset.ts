export default defineNuxtRouteMiddleware(async () => {
  const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

  try {
    await $fetch('/api/auth/password-reset-status', {
      credentials: 'include',
      headers,
    })
  } catch {
    return navigateTo('/recover-password')
  }
})
