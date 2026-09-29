<script setup lang="ts">
const props = defineProps<{
  canEditOrganization: boolean
  locale: 'ru' | 'en'
}>()

const auth = useAuthStore()
const { user } = storeToRefs(auth)

const emit = defineEmits<{
  (e: 'goDashboard'): void
  (e: 'logout'): void
  (e: 'openEditOrganizationModal'): void
  (e: 'isOpen', v: boolean): void
}>()
const {setLocale} = useI18n()
</script>

<template>
  <div
    class="absolute top-[calc(100%+0.75rem)] right-0 z-50 w-64 rounded-lg border border-[var(--border-main)] bg-[var(--bg-context)] p-2 text-[var(--text-main)] shadow-xl"
  >
    <template v-if="user">
      <NuxtLink
        to="/dashboard"
        class="flex min-h-11 items-center rounded-md px-2 font-medium hover:bg-[var(--bg-hover-context)]"
        @click="emit('goDashboard')"
      >
        {{ $t('ui.dashboard') }}
      </NuxtLink>
      <button
        v-if="canEditOrganization"
        type="button"
        class="flex min-h-11 w-full items-center rounded-md px-2 text-left font-medium hover:bg-[var(--bg-hover-context)]"
        @click="emit('openEditOrganizationModal')"
      >
        {{ $t('modal.editOrganization') }}
      </button>
    </template>
    <NuxtLink
      v-else
      to="/login"
      class="flex min-h-11 items-center rounded-md px-2 font-medium hover:bg-[var(--bg-hover-context)]"
      @click="emit('isOpen', false)"
    >
      {{ $t('auth.login') }}
    </NuxtLink>
    <div class="flex min-h-11 items-center justify-between gap-3 px-2">
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
    <div class="flex min-h-11 items-center justify-between gap-3 px-2">
      <span>{{ $t('ui.theme') }}</span>
      <ToggleTheme />
    </div>
    <button
      v-if="user"
      type="button"
      class="mt-1 flex min-h-11 w-full items-center rounded-md px-2 text-left text-[var(--btn-delete-text)] hover:bg-[var(--bg-hover-context)]"
      @click="emit('logout')"
    >
      {{ $t('auth.logout') }}
    </button>
  </div>
</template>
