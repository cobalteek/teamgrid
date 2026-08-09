<script setup lang="ts">
import { storeToRefs } from 'pinia'

const auth = useAuthStore()
const { user } = storeToRefs(auth)
const { locale, setLocale } = useI18n()

async function logout() {
  await auth.logout()
  await navigateTo('/')
}
</script>

<template>
  <div class="min-h-screen bg-[var(--bg-back)] text-[var(--text-main)]">
    <header class="flex items-center justify-between bg-[var(--bg-header)] px-4 py-3">
      <NuxtLink to="/" class="font-semibold">Fullstack Starter</NuxtLink>
      <nav class="flex items-center gap-3">
        <select :value="locale" class="select" @change="setLocale(($event.target as HTMLSelectElement).value as 'ru' | 'en')">
          <option value="ru">{{ $t('locale.ru') }}</option>
          <option value="en">{{ $t('locale.en') }}</option>
        </select>
        <ToggleTheme />
        <template v-if="user">
          <span>{{ user.name }}</span>
          <button class="btn px-2 py-1" @click="logout">Log out</button>
        </template>
        <template v-else>
          <NuxtLink to="/sign-in">{{ $t('auth.signIn') }}</NuxtLink>
          <NuxtLink to="/sign-up">{{ $t('auth.signUp') }}</NuxtLink>
        </template>
      </nav>
    </header>
    <main class="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl items-center justify-center p-6">
      <slot />
    </main>
  </div>
</template>
