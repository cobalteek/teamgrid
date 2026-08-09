export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()
  await auth.init()

  if (auth.isAuthed) {
    return navigateTo('/')
  }
})
