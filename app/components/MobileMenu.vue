<script setup lang="ts">
defineProps<{
  canEditOrganization: boolean
}>()

const auth = useAuthStore()
const { user } = storeToRefs(auth)

const emit = defineEmits<{
  (e: 'goDashboard' | 'logout' | 'openEditOrganizationModal'): void
  (e: 'isOpen', v: boolean): void
}>()
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
      <NuxtLink
        to="/settings"
        class="flex min-h-11 items-center rounded-lg px-3 font-medium transition hover:bg-[var(--bg-hover-context)]"
        @click="emit('isOpen', false)"
      >
        {{ $t('ui.settings') }}
      </NuxtLink>
      <NuxtLink
        v-if="canEditOrganization"
        to="/bonus"
        class="flex min-h-11 items-center rounded-lg px-3 font-medium transition hover:bg-[var(--bg-hover-context)]"
        @click="emit('isOpen', false)"
      >
        {{ $t('ui.bonus') }}
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
