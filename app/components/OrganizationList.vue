<script setup lang="ts">
import type { OrganizationAccess } from '~~/types/organization'
import type { User } from '~~/types/user'

type OrganizationStats = {
  users: User[]
  employeeCount: number
  isLoading: boolean
}

const auth = useAuthStore()
const organizationStore = useOrganizationStore()
const organizations = computed(() => organizationStore.organizations)
const stats = ref<Record<number, OrganizationStats>>({})
const isLoading = ref(false)
const isAddOrganizationModalOpen = ref(false)

function roleLabel(role: OrganizationAccess['role']) {
  const labels = {
    owner: 'ui.owner',
    admin: 'ui.admin',
    user: 'ui.user',
  } as const

  return $t(labels[role])
}

function initials(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || '?'
}

function organizationStats(organizationId: number) {
  return stats.value[organizationId]
}

async function loadOrganizationStats(organization: OrganizationAccess) {
  stats.value[organization.id] = {
    users: [],
    employeeCount: 0,
    isLoading: true,
  }

  try {
    const [users, employees] = await Promise.all([
      $fetch<User[]>('/api/user', {
        credentials: 'include',
        query: { organizationId: organization.id },
      }),
      $fetch<Array<{ id: string }>>('/api/employee', {
        credentials: 'include',
        query: { organizationId: organization.id },
      }),
    ])

    stats.value[organization.id] = {
      users,
      employeeCount: employees.length,
      isLoading: false,
    }
  } catch (error) {
    console.error('Failed to load organization summary:', error)
    stats.value[organization.id] = {
      users: [],
      employeeCount: 0,
      isLoading: false,
    }
  }
}

async function loadOrganizations(force = false) {
  if (!auth.user) return

  isLoading.value = true
  try {
    if (force) await organizationStore.getOrganizations()
    else await organizationStore.initialize()
    await Promise.all(organizations.value.map(loadOrganizationStats))
  } catch (error) {
    console.error('Failed to load organizations:', error)
  } finally {
    isLoading.value = false
  }
}

async function goToOrganization(organization: OrganizationAccess) {
  await organizationStore.changeOrganization(organization)
  await navigateTo('/dashboard')
}

onMounted(() => {
  void loadOrganizations()
})
</script>

<template>
  <section v-if="auth.user" class="w-full max-w-5xl border-t border-[var(--border-main)] pt-8">
    <div class="mb-5 flex items-end justify-between gap-4">
      <div>
        <p class="text-xs font-semibold tracking-[0.14em] text-[var(--text-muted)] uppercase">
          {{ $t('ui.organizations') }}
        </p>
        <h2 class="mt-1 text-2xl font-bold text-[var(--text-main)]">
          {{ $t('ui.yourOrganizations') }}
        </h2>
      </div>
      <div class="flex items-center gap-2">
        <span
          class="rounded-full bg-[var(--input-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--text-soft)]"
        >
          {{ organizations.length }}
        </span>
        <button
          type="button"
          class="group inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border-main)] bg-[var(--btn-bg)] px-3 text-sm font-semibold text-[var(--text-soft)] transition hover:border-[var(--text-blue)] hover:bg-[var(--bg-hover-context)] hover:text-[var(--text-blue)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-blue)] active:scale-[0.98]"
          :aria-label="$t('ui.organization.add')"
          @click="isAddOrganizationModalOpen = true"
        >
          <svg
            class="h-4 w-4 transition-transform group-hover:rotate-90"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span class="hidden sm:inline">{{ $t('ui.organization.add') }}</span>
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="grid gap-4 sm:grid-cols-2">
      <div
        v-for="item in 2"
        :key="item"
        class="h-56 animate-pulse rounded-2xl border border-[var(--border-main)] bg-[var(--input-bg)]"
      />
    </div>

    <div v-else-if="organizations.length" class="grid gap-4 sm:grid-cols-2">
      <button
        v-for="organization in organizations"
        :key="organization.id"
        type="button"
        class="group flex min-h-56 flex-col rounded-2xl border border-[var(--border-main)] bg-[var(--btn-bg)] p-5 text-left transition hover:-translate-y-0.5 hover:border-[var(--text-blue)] hover:bg-[var(--bg-hover-context)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-blue)]"
        @click="goToOrganization(organization)"
      >
        <div class="flex items-start justify-between gap-4">
          <span
            class="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[var(--border-main)] bg-[var(--input-bg)] text-lg font-bold text-[var(--text-blue)]"
            aria-hidden="true"
          >
            {{ initials(organization.name) }}
          </span>
          <span
            class="rounded-full border border-[var(--border-main)] px-2.5 py-1 text-xs font-semibold text-[var(--text-soft)]"
          >
            {{ roleLabel(organization.role) }}
          </span>
        </div>

        <div class="mt-4 min-w-0">
          <h3 class="truncate text-lg font-bold text-[var(--text-main)]">
            {{ organization.name }}
          </h3>
          <p class="mt-1 min-h-10 text-sm leading-5 text-[var(--text-soft)]">
            {{ organization.description || '—' }}
          </p>
        </div>

        <div class="mt-auto pt-5">
          <div class="grid grid-cols-2 gap-2 border-t border-[var(--border-main)] pt-4">
            <div class="rounded-xl bg-[var(--input-bg)] px-3 py-2">
              <span class="block text-xs text-[var(--text-muted)]">{{ $t('ui.users') }}</span>
              <span class="mt-1 block text-lg font-bold text-[var(--text-main)]">
                {{
                  organizationStats(organization.id)?.isLoading
                    ? '—'
                    : (organizationStats(organization.id)?.users.length ?? '—')
                }}
              </span>
            </div>
            <div class="rounded-xl bg-[var(--input-bg)] px-3 py-2">
              <span class="block text-xs text-[var(--text-muted)]">{{ $t('ui.employees') }}</span>
              <span class="mt-1 block text-lg font-bold text-[var(--text-main)]">
                {{
                  organizationStats(organization.id)?.isLoading
                    ? '—'
                    : (organizationStats(organization.id)?.employeeCount ?? '—')
                }}
              </span>
            </div>
          </div>

          <div
            v-if="organizationStats(organization.id)?.users.length"
            class="mt-3 flex items-center gap-2"
          >
            <div class="flex -space-x-2">
              <span
                v-for="user in organizationStats(organization.id)?.users.slice(0, 4)"
                :key="user.id"
                class="grid h-7 w-7 place-items-center rounded-full border-2 border-[var(--btn-bg)] bg-[var(--bg-context)] text-[0.65rem] font-bold text-[var(--text-blue)]"
                :title="user.name"
              >
                {{ initials(user.name) }}
              </span>
            </div>
            <span class="truncate text-xs text-[var(--text-muted)]">
              {{
                organizationStats(organization.id)
                  ?.users.slice(0, 4)
                  .map((user) => user.name)
                  .join(', ')
              }}<span v-if="(organizationStats(organization.id)?.users.length ?? 0) > 4">
                +{{ (organizationStats(organization.id)?.users.length ?? 0) - 4 }}
              </span>
            </span>
          </div>
        </div>

        <span
          class="mt-4 flex items-center gap-1 text-sm font-semibold text-[var(--text-blue)] opacity-80 transition group-hover:gap-2 group-hover:opacity-100"
        >
          {{ $t('ui.dashboard') }}
          <span aria-hidden="true">→</span>
        </span>
      </button>
    </div>

    <p
      v-else
      class="rounded-2xl border border-dashed border-[var(--border-main)] p-6 text-center text-sm text-[var(--text-muted)]"
    >
      —
    </p>
  </section>
  <AddOrganizationModalContent
    v-if="auth.user"
    :model-value="isAddOrganizationModalOpen"
    @close="isAddOrganizationModalOpen = false"
    @submit="void loadOrganizations(true)"
  />
</template>
