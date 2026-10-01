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

async function updateOrganizationAccess() {
  if (!user.value || !isDashboard.value || !organizationStore.currentOrganizationId) {
    canEditOrganization.value = false
    return
  }

  try {
    canEditOrganization.value = Boolean(await organizationStore.isManager())
  } catch {
    canEditOrganization.value = false
  }
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
    class="sticky top-0 z-40 flex flex-wrap items-center gap-3 bg-[var(--bg-header)] px-3 py-3 sm:px-4"
  >
    <NuxtLink to="/" class="shrink-0 font-semibold">{{activeBranch === 'master' ? 'TeamGrid' : 'TeamGrid Dev'}}</NuxtLink>
    <ClientOnly>
      <div v-if="user && isDashboard" class="order-3 w-full min-w-0 md:order-none md:w-auto">
        <OrganizationSwitcher @addOrganization="openModal" />
      </div>
    </ClientOnly>
    <nav class="ml-auto hidden min-w-0 items-center gap-1.5 sm:flex sm:gap-3">
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
    <div class="relative ml-auto sm:hidden">
      <button
        type="button"
        class="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-md border border-[var(--border-main)] text-[var(--text-main)] transition hover:bg-[var(--bg-hover-context)]"
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
        :locale="locale"
        :can-edit-organization="canEditOrganization"
        @open-edit-organization-modal="openEditOrganizationModal"
        @go-dashboard="goDashboard"
        @logout="logout"
        @is-open="isMobileMenuOpen, false"
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
