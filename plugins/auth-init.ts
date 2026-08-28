import {defineNuxtPlugin} from "nuxt/app"
import {useAuthStore} from "../app/stores/auth";
import { useOrganizationStore } from "../app/stores/organization";

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  await authStore.init()
})
