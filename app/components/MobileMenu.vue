<script setup lang="ts">
defineProps<{
  canEditOrganization: boolean
  locale: 'ru' | 'en'
}>()

const auth = useAuthStore()
const { user } = storeToRefs(auth)

const emit = defineEmits<{
  (e: 'goDashboard' | 'logout' | 'openEditOrganizationModal'): void
  (e: 'isOpen', v: boolean): void
}>()
const { setLocale } = useI18n()
</script>

<template>
  <div
    class="absolute top-[calc(100%+0.625rem)] right-0 z-50 w-[min(20rem,calc(100vw-1.5rem))] rounded-xl border border-[var(--border-main)] bg-[var(--bg-context)] p-2.5 text-[var(--text-main)] shadow-2xl"
  >
    <template v-if="user">
      <NuxtLink
        to="/dashboard"
        class="flex min-h-11 items-center rounded-lg px-3 font-medium transition hover:bg-[var(--bg-hover-context)]"
        @click="emit('goDashboard')"
      >
        {{ $t('ui.dashboard') }}
      </NuxtLink>
      <button
        v-if="canEditOrganization"
        type="button"
        class="flex min-h-11 w-full items-center rounded-lg px-3 text-left font-medium transition hover:bg-[var(--bg-hover-context)]"
        @click="emit('openEditOrganizationModal')"
      >
        {{ $t('modal.editOrganization') }}
      </button>
    </template>
    <NuxtLink
      v-else
      to="/login"
      class="flex min-h-11 items-center rounded-lg px-3 font-medium transition hover:bg-[var(--bg-hover-context)]"
      @click="emit('isOpen', false)"
    >
      {{ $t('auth.login') }}
    </NuxtLink>
    <div
      class="mt-2 flex min-h-11 items-center justify-between gap-3 border-t border-[var(--border-main)] px-3 pt-2"
    >
      <span>{{ $t('ui.language') }}</span>
      <select
        :value="locale"
        class="select min-h-9"
        :aria-label="$t('ui.language')"
        @change="setLocale(($event.target as HTMLSelectElement).value as 'ru' | 'en')"
      >
        <option value="ru">Ru</option>
        <option value="en">En</option>
      </select>
    </div>
    <div class="flex min-h-11 items-center justify-between gap-3 px-3">
      <span>{{ $t('ui.theme') }}</span>
      <ToggleTheme />
    </div>
    <button
      v-if="user"
      type="button"
      class="mt-2 flex min-h-11 w-full items-center rounded-lg border-t border-[var(--border-main)] px-3 pt-2 text-left text-[var(--btn-delete-text)] transition hover:bg-[var(--bg-hover-context)]"
      @click="emit('logout')"
    >
      {{ $t('auth.logout') }}
    </button>
  </div>
</template>
