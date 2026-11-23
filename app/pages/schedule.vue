<script setup lang="ts">
import { storeToRefs } from 'pinia'

definePageMeta({
  middleware: ['auth', 'manager'],
  layout: 'dashboard-admin',
})

const organizationStore = useOrganizationStore()
const { isManager } = storeToRefs(organizationStore)
const title = computed(() => organizationStore.currentOrganization?.name)
const isAddShiftModalOpen = ref(false)
const isAddEmployeeModalOpen = ref(false)
const isAddPositionModalOpen = ref(false)
const isAddVacationModalOpen = ref(false)
const isEditOrganizationModalOpen = ref(false)
const isDeleteShiftsModalOpen = ref(false)
const selectedShiftEmployeeId = ref('')
const todayKey = new Date().toISOString().split('T')[0] ?? ''
const infoDate = ref({
  dateStr: todayKey,
  date: new Date(`${todayKey}T00:00:00Z`),
})

useHead({
  title: computed(() => `${$t('schedule.title')} — ${title.value || 'TeamGrid'}`),
})

function openAddShift() {
  selectedShiftEmployeeId.value = ''
  infoDate.value = {
    dateStr: todayKey,
    date: new Date(`${todayKey}T00:00:00Z`),
  }
  isAddShiftModalOpen.value = true
}

function openAddShiftFromCell(payload: { dateStr: string; employeeId: string }) {
  selectedShiftEmployeeId.value = payload.employeeId
  infoDate.value = {
    dateStr: payload.dateStr,
    date: new Date(`${payload.dateStr}T00:00:00Z`),
  }
  isAddShiftModalOpen.value = true
}

function closeAddShift() {
  selectedShiftEmployeeId.value = ''
  isAddShiftModalOpen.value = false
}
</script>

<template>
  <div class="w-full min-w-0">
    <div class="hidden md:block">
      <div v-if="isManager" class="mb-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          class="min-h-10 rounded-lg border border-[var(--border-main)] bg-[var(--btn-bg)] px-3 text-sm font-semibold text-[var(--text-soft)] transition hover:border-[var(--text-blue)] hover:text-[var(--text-blue)]"
          @click="openAddShift"
        >
          {{ $t('btn.addShift') }}
        </button>
        <button
          type="button"
          class="min-h-10 rounded-lg border border-[var(--border-main)] bg-[var(--btn-bg)] px-3 text-sm font-semibold text-[var(--text-soft)] transition hover:border-[var(--text-blue)] hover:text-[var(--text-blue)]"
          @click="isAddEmployeeModalOpen = true"
        >
          {{ $t('btn.addEmployee') }}
        </button>
        <button
          type="button"
          class="min-h-10 rounded-lg border border-[var(--border-main)] bg-[var(--btn-bg)] px-3 text-sm font-semibold text-[var(--text-soft)] transition hover:border-[var(--text-blue)] hover:text-[var(--text-blue)]"
          @click="isAddPositionModalOpen = true"
        >
          {{ $t('form.addPosition') }}
        </button>
        <button
          type="button"
          class="min-h-10 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 text-sm font-semibold text-amber-700 transition hover:border-amber-500 hover:bg-amber-500/20 dark:text-amber-300"
          @click="isAddVacationModalOpen = true"
        >
          {{ $t('schedule.addVacation') }}
        </button>
        <button
          type="button"
          class="min-h-10 rounded-lg border border-[var(--border-main)] bg-[var(--btn-bg)] px-3 text-sm font-semibold text-[var(--text-soft)] transition hover:border-[var(--text-blue)] hover:text-[var(--text-blue)]"
          @click="isEditOrganizationModalOpen = true"
        >
          {{ $t('schedule.editOrganization') }}
        </button>
        <button
          type="button"
          class="min-h-10 rounded-lg border border-[var(--border-main)] bg-[var(--btn-bg)] px-3 text-sm font-semibold text-[var(--text-soft)] transition hover:border-[var(--btn-delete-bg)] hover:text-[var(--btn-delete-text)]"
          @click="isDeleteShiftsModalOpen = true"
        >
          {{ $t('btn.deleteShifts') }}
        </button>
      </div>
      <ScheduleTable @add-shift="openAddShiftFromCell" />
    </div>
    <div
      class="flex min-h-[50vh] items-center justify-center rounded-2xl border border-[var(--border-main)] bg-[var(--bg-context)] p-6 text-center md:hidden"
    >
      <div class="max-w-sm">
        <h1 class="text-xl font-bold text-[var(--text-main)]">
          {{ $t('schedule.desktopOnlyTitle') }}
        </h1>
        <p class="mt-2 text-sm leading-6 text-[var(--text-muted)]">
          {{ $t('schedule.desktopOnlyText') }}
        </p>
      </div>
    </div>
    <AddShiftModalContent
      :info="infoDate"
      :model-value="isAddShiftModalOpen"
      :employee-id="selectedShiftEmployeeId || undefined"
      @close="closeAddShift"
    />
    <AddEmployeeModalContent
      :model-value="isAddEmployeeModalOpen"
      @close="isAddEmployeeModalOpen = false"
    />
    <AddPositionForm
      :model-value="isAddPositionModalOpen"
      @close="isAddPositionModalOpen = false"
    />
    <AddVacationModalContent
      :model-value="isAddVacationModalOpen"
      @close="isAddVacationModalOpen = false"
    />
    <EditOrganizationModalContent
      :model-value="isEditOrganizationModalOpen"
      @close="isEditOrganizationModalOpen = false"
    />
    <DeleteShiftsModalContent
      :model-value="isDeleteShiftsModalOpen"
      @close="isDeleteShiftsModalOpen = false"
    />
  </div>
</template>
