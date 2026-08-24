import {defineNuxtPlugin} from "nuxt/app"
import {useAuthStore} from "../app/stores/auth";
import { useOrganizationStore } from "../app/stores/organization";

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  const organizationStore = useOrganizationStore()
  await authStore.init()
  await organizationStore.initialze()
})
