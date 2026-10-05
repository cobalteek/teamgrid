export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()
  await auth.init()

  if (!auth.isAuthed) {
    return navigateTo('/login')
  }

  if (!auth.user?.emailVerifiedAt) {
    return navigateTo({
      path: '/verify-email',
      query: { email: auth.user?.email },
    })
  }
})
