<script setup lang="ts">
import type { Organization } from '~~/types/organization'
import { useOrganizationStore } from '../stores/organization'

const emit = defineEmits<{
  (e: 'addOrganization'): void
}>()

function addOrganization() {
  emit('addOrganization')
}

const organization = ref<Organization>({
  id: 1,
  name: '',
  description: '',
})

const organizationStore = useOrganizationStore()
const useInit = useInitializeApp()

watch(
  () => organizationStore.currentOrganization,
  (current) => {
    if (current) organization.value.id = current?.id
  },
  { immediate: true },
)

watch(organization.value, async () => {
  const orgId = organization.value
  if (!orgId) {
    throw createError({
      statusCode: 404,
      statusMessage: 'error.organization.notFound',
    })
  }
  await organizationStore.changeOrganization(orgId)
  await useInit.init()
})
</script>

<template>
  <div class="flex w-full min-w-0 items-center gap-2 md:w-auto">
    <div
      class="flex h-[3.25rem] min-w-0 flex-1 items-center gap-2 rounded-xl border border-[var(--border-main)] bg-[var(--btn-bg)] px-2.5 transition focus-within:border-[var(--text-blue)] md:w-[18rem] md:flex-none"
    >
      <svg
        class="h-4 w-4 shrink-0 text-[var(--text-muted)]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M3 21h18" />
        <path d="M5 21V5l7-2 7 2v16" />
        <path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M9 16h.01M15 16h.01" />
      </svg>
      <label class="sr-only" for="header-organization">
        {{ $t('ui.currentOrganization') }}
      </label>
      <select
        id="header-organization"
        v-model="organization.id"
        class="min-h-0 min-w-0 flex-1 cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-[var(--text-main)] outline-none"
      >
        <option v-for="org in organizationStore.options" :key="org.value" :value="org.value">
          {{ org.label }}
        </option>
      </select>
    </div>
    <button
      type="button"
      class="group flex h-[3.25rem] w-[3.25rem] shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[var(--border-main)] bg-[var(--btn-bg)] text-[var(--text-soft)] transition hover:border-[var(--text-blue)] hover:bg-[var(--bg-hover-context)] hover:text-[var(--text-blue)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-blue)] active:scale-[0.98]"
      :aria-label="$t('ui.organization.add')"
      :title="$t('ui.organization.add')"
      @click="addOrganization"
    >
      <svg
        class="h-5 w-5 transition-transform group-hover:rotate-90"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  </div>
</template>
