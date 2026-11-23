export default defineNuxtRouteMiddleware(async () => {
  const organizationStore = useOrganizationStore()
  await organizationStore.initialize()

  if (!organizationStore.isManager) {
    return navigateTo('/notManager')
  }
})
