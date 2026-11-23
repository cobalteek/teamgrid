<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

const route = useRoute()

const auth = useAuthStore()
const { user } = storeToRefs(auth)
const organizationStore = useOrganizationStore()
const { locale, setLocale } = useI18n()
const { activeBranch } = useAppConfig()

const isOpenOrganizationModal = ref(false)
const isEditOrganizationModalOpen = ref(false)
const isMobileMenuOpen = ref(false)
const canEditOrganization = ref(false)

const openModal = () => {
  isOpenOrganizationModal.value = true
}

async function logout() {
  await auth.logout()
  await navigateTo('/')
}
async function goDashboard() {
  isMobileMenuOpen.value = false
  await navigateTo('/dashboard')
}

function openEditOrganizationModal() {
  isMobileMenuOpen.value = false
  isEditOrganizationModalOpen.value = true
}

const isDashboard = computed(() => route.name === 'dashboard')
const isSchedule = computed(() => route.name === 'schedule')
const isBonus = computed(() => route.name === 'bonus')
const showOrganizationSwitcher = computed(
  () => isDashboard.value || isSchedule.value || isBonus.value,
)

function updateOrganizationAccess() {
  canEditOrganization.value = Boolean(
    user.value &&
    (isDashboard.value || isBonus.value) &&
    organizationStore.currentOrganizationId &&
    organizationStore.isManager,
  )
}

watch(
  () => route.fullPath,
  () => {
    isMobileMenuOpen.value = false
  },
)

watch(
  [() => user.value?.id, () => route.name, () => organizationStore.currentOrganizationId],
  updateOrganizationAccess,
  { immediate: true },
)
</script>

<template>
  <header
    class="sticky top-0 z-40 flex flex-wrap items-center gap-2.5 border-b border-[var(--border-main)] bg-[var(--bg-header)] px-3 py-2.5 sm:gap-3 sm:px-4"
  >
    <NuxtLink
      to="/"
      class="text-md flex h-[3.25rem] shrink-0 items-center rounded-xl border border-transparent px-2.5 font-bold tracking-tight transition hover:border-[var(--border-main)] hover:bg-[var(--bg-hover-context)] sm:px-3"
    >
      {{ activeBranch === 'master' ? 'TeamGrid' : 'TeamGrid Dev' }}
    </NuxtLink>
    <ClientOnly>
      <div
        v-if="user && showOrganizationSwitcher"
        class="order-3 w-full min-w-0 md:order-none md:w-auto"
      >
        <OrganizationSwitcher @add-organization="openModal" />
      </div>
    </ClientOnly>
    <nav class="ml-auto hidden min-w-0 items-center gap-2 sm:flex sm:gap-3">
      <template v-if="user">
        <NuxtLink
          v-if="organizationStore.isManager"
          to="/schedule"
          class="group hidden h-[3.25rem] w-[3.25rem] items-center justify-center rounded-xl border border-transparent transition hover:border-[var(--border-main)] hover:bg-[var(--bg-hover-context)] hover:text-[var(--text-blue)] md:flex"
          :class="
            isSchedule
              ? 'border-[var(--border-main)] bg-[var(--bg-hover-context)] text-[var(--text-blue)]'
              : ''
          "
          :title="$t('ui.managerSchedule')"
          :aria-label="$t('ui.managerSchedule')"
          :aria-current="isSchedule ? 'page' : undefined"
        >
          <svg
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="4.5" width="18" height="16" rx="2" />
            <path d="M16 2.5v4M8 2.5v4M3 9.5h18M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" />
          </svg>
          <span class="sr-only">{{ $t('ui.managerSchedule') }}</span>
        </NuxtLink>
        <NuxtLink
          v-if="organizationStore.isManager"
          to="/bonus"
          class="group hidden h-[3.25rem] w-[3.25rem] items-center justify-center rounded-xl border border-transparent transition hover:border-[var(--border-main)] hover:bg-[var(--bg-hover-context)] hover:text-[var(--text-blue)] md:flex"
          :class="
            isBonus
              ? 'border-[var(--border-main)] bg-[var(--bg-hover-context)] text-[var(--text-blue)]'
              : ''
          "
          :title="$t('ui.bonus')"
          :aria-label="$t('ui.bonus')"
          :aria-current="isBonus ? 'page' : undefined"
        >
          <svg
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path
              d="M12 3v18M17 7.5c0-1.7-2.2-3-5-3s-5 1.3-5 3 2.2 3 5 3 5 1.3 5 3-2.2 3-5 3-5-1.3-5-3"
            />
          </svg>
          <span class="sr-only">{{ $t('ui.bonus') }}</span>
        </NuxtLink>
        <NuxtLink
          to="/settings"
          class="group hidden h-[3.25rem] w-[3.25rem] items-center justify-center rounded-xl border border-transparent transition hover:border-[var(--border-main)] hover:bg-[var(--bg-hover-context)] hover:text-[var(--text-blue)] md:flex"
          :class="
            route.name === 'settings'
              ? 'border-[var(--border-main)] bg-[var(--bg-hover-context)] text-[var(--text-blue)]'
              : ''
          "
          :title="$t('ui.settings')"
          :aria-label="$t('ui.settings')"
          :aria-current="route.name === 'settings' ? 'page' : undefined"
        >
          <svg
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
            <path
              d="m19.4 15 .1.1a2 2 0 1 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4v.3a2 2 0 1 1-4 0v-.3a2 2 0 0 0-3.4-1.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A2 2 0 0 0 3.6 12a2 2 0 0 0-.6-1.4l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A2 2 0 0 0 9.2 6.4H9a2 2 0 1 1 4 0v.1a2 2 0 0 0 3.4 1.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a2 2 0 0 0 0 3.4Z"
            />
          </svg>
          <span class="sr-only">{{ $t('ui.settings') }}</span>
        </NuxtLink>
        <button
          type="button"
          class="group hidden max-w-56 min-w-0 cursor-pointer items-center gap-2 rounded-xl border border-[var(--border-main)] bg-[var(--btn-bg)] px-2 py-1.5 text-left transition hover:border-[var(--text-blue)] hover:bg-[var(--bg-hover-context)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-blue)] sm:flex"
          :aria-label="`${user.name} — ${$t('pages.dashboard')}`"
          :aria-current="isDashboard ? 'page' : undefined"
          @click="goDashboard"
        >
          <span
            class="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[var(--border-main)] bg-[var(--input-bg)] text-base font-bold text-[var(--text-blue)]"
            aria-hidden="true"
          >
            {{ user.name?.slice(0, 1).toUpperCase() || '?' }}
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-semibold text-[var(--text-main)]">
              {{ user.name || '—' }}
            </span>
            <span
              class="mt-0.5 block truncate text-xs text-[var(--text-muted)] transition group-hover:text-[var(--text-soft)]"
            >
              {{ $t('ui.dashboard') }}
            </span>
          </span>
          <svg
            class="h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--text-blue)]"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M7.21 14.77a.75.75 0 0 1 .02-1.06L10.94 10 7.23 6.29a.75.75 0 1 1 1.06-1.06l4.24 4.24a.75.75 0 0 1 0 1.06l-4.24 4.24a.75.75 0 0 1-1.08 0Z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <button
          type="button"
          class="group flex h-[3.25rem] min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-[var(--border-main)] bg-[var(--btn-bg)] px-3 text-sm font-semibold text-[var(--text-soft)] transition hover:border-[var(--btn-delete-text)] hover:bg-[var(--bg-hover-context)] hover:text-[var(--btn-delete-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--btn-delete-text)] active:scale-[0.98]"
          @click="logout"
        >
          <svg
            class="h-4 w-4 shrink-0 text-[var(--text-muted)] transition-colors group-hover:text-[var(--btn-delete-text)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          {{ $t('auth.logout') }}
        </button>
      </template>
      <template v-else>
        <select
          :value="locale"
          class="select h-[3.25rem] cursor-pointer rounded-xl border-[var(--border-main)] bg-[var(--btn-bg)] px-3 text-xs font-semibold tracking-wide uppercase transition outline-none hover:border-[var(--text-blue)] focus:border-[var(--text-blue)]"
          aria-label="Language"
          @change="setLocale(($event.target as HTMLSelectElement).value as 'ru' | 'en')"
        >
          <option value="ru">Ru</option>
          <option value="en">En</option>
        </select>
        <ToggleTheme />
        <NuxtLink
          class="flex h-[3.25rem] items-center rounded-xl border border-transparent px-3 text-sm font-semibold transition hover:border-[var(--border-main)] hover:bg-[var(--bg-hover-context)]"
          to="/login"
        >
          {{ $t('auth.login') }}
        </NuxtLink>
        <NuxtLink
          to="/sign-up"
          class="hidden h-[3.25rem] items-center rounded-xl border border-[var(--border-main)] bg-[var(--btn-bg)] px-3 text-sm font-semibold transition hover:border-[var(--text-blue)] hover:bg-[var(--bg-hover-context)] hover:text-[var(--text-blue)] sm:flex"
        >
          {{ $t('auth.signUp') }}
        </NuxtLink>
      </template>
    </nav>
    <div class="relative ml-auto sm:hidden">
      <button
        type="button"
        class="flex h-[3.25rem] w-[3.25rem] flex-col items-center justify-center gap-1.5 rounded-xl border border-[var(--border-main)] bg-[var(--btn-bg)] text-[var(--text-main)] transition hover:border-[var(--text-blue)] hover:bg-[var(--bg-hover-context)] hover:text-[var(--text-blue)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-blue)]"
        :aria-expanded="isMobileMenuOpen"
        :aria-label="$t('ui.menu')"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
      >
        <span class="h-0.5 w-5 rounded-full bg-current" aria-hidden="true" />
        <span class="h-0.5 w-5 rounded-full bg-current" aria-hidden="true" />
        <span class="h-0.5 w-5 rounded-full bg-current" aria-hidden="true" />
      </button>
      <MobileMenu
        v-if="isMobileMenuOpen"
        :can-edit-organization="canEditOrganization"
        @open-edit-organization-modal="openEditOrganizationModal"
        @go-dashboard="goDashboard"
        @logout="logout"
        @is-open="isMobileMenuOpen = false"
      />
    </div>
  </header>
  <AddOrganizationModalContent
    :model-value="isOpenOrganizationModal"
    @close="isOpenOrganizationModal = false"
  />
  <EditOrganizationModalContent
    :model-value="isEditOrganizationModalOpen"
    @close="isEditOrganizationModalOpen = false"
  />
</template>
