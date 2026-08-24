<script setup lang="ts">
import { storeToRefs } from 'pinia'

const auth = useAuthStore()
const organizationStore = useOrganizationStore()
const { user } = storeToRefs(auth)
const { locale, setLocale } = useI18n()

const isOpenOrganizationModal = ref(false)

const openModal = () => {
  isOpenOrganizationModal.value = true
}

async function logout() {
  await auth.logout()
  await navigateTo('/')
}
async function goDashboard() {
    await navigateTo('/dashboard')
}

</script>

<template>
    <header class="flex items-center justify-between bg-[var(--bg-header)] px-4 py-3">
      <NuxtLink to="/" class="font-semibold">TeamGrid</NuxtLink>
      <OrganizationSwitcher @addOrganization="openModal"/>
      <nav class="flex items-center gap-3">
        <select :value="locale" class="select" @change="setLocale(($event.target as HTMLSelectElement).value as 'ru' | 'en')">
          <option value="ru">Ru</option>
          <option value="en">En</option>
        </select>
        <ToggleTheme />
        <template v-if="user">
          <span @click="goDashboard" class="cursor-pointer">{{ user.name }}</span>
          <button class="btn px-2 py-1 cursor-pointer" @click="logout">Log out</button>
        </template>
        <template v-else>
          <NuxtLink to="/sign-in">{{ $t('auth.signIn') }}</NuxtLink>
          <NuxtLink to="/sign-up">{{ $t('auth.signUp') }}</NuxtLink>
        </template>
      </nav>
    </header>
    <AddOrganizationModalContent
      :model-value="isOpenOrganizationModal"
      @close="isOpenOrganizationModal = false"
    />
</template>