<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

const route = useRoute()

const auth = useAuthStore()
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

const isDashboard = computed(() => route.name === 'dashboard')

</script>

<template>
    <header class="flex flex-wrap items-center gap-3 bg-[var(--bg-header)] px-3 py-3 sm:px-4">
      <NuxtLink to="/" class="shrink-0 font-semibold">TeamGrid</NuxtLink>
      <ClientOnly>
        <div
          v-if="user && isDashboard"
          class="order-3 w-full min-w-0 md:order-none md:w-auto"
        >
          <OrganizationSwitcher @addOrganization="openModal"/>
        </div>
      </ClientOnly>
      <nav class="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-3">
        <select
          :value="locale"
          class="select min-h-11 px-2 sm:min-h-0"
          aria-label="Language"
          @change="setLocale(($event.target as HTMLSelectElement).value as 'ru' | 'en')"
        >
          <option value="ru">Ru</option>
          <option value="en">En</option>
        </select>
        <ToggleTheme />
        <template v-if="user">
          <button
            type="button"
            class="hidden max-w-28 truncate px-1 text-left sm:inline"
            @click="goDashboard"
          >
            {{ user.name }}
          </button>
          <button class="btn min-h-11 px-2 py-1 sm:min-h-0" @click="logout">
            {{ $t('auth.logout') }}
          </button>
        </template>
        <template v-else>
          <NuxtLink class="flex min-h-11 items-center px-1 sm:min-h-0" to="/login">
            {{ $t('auth.login') }}
          </NuxtLink>
          <NuxtLink to="/sign-up" class="btn hidden min-h-11 items-center px-2 sm:flex sm:min-h-0">
            {{ $t('auth.signUp') }}
          </NuxtLink>
        </template>
      </nav>
    </header>
    <AddOrganizationModalContent
      :model-value="isOpenOrganizationModal"
      @close="isOpenOrganizationModal = false"
    />
</template>
