<script setup lang="ts">
import type { DeleteShiftFilters } from '~~/types/shift'

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ close: []; deleted: [count: number] }>()

const shiftStore = useShiftStore()
const employeeStore = useEmployeeStore()
const positionStore = usePositionStore()
const errorModal = useErrorModal()
const isSubmitting = ref(false)
const confirmDeleteAll = ref(false)
const filters = reactive<DeleteShiftFilters>({
  startDate: '',
  endDate: '',
  employeeIds: [],
  positionIds: [],
  deleteAll: false,
})

type RequestError = {
  data?: { message?: string }
  message?: string
}

const hasFilters = computed(
  () =>
    Boolean(filters.startDate && filters.endDate) ||
    Boolean(filters.employeeIds?.length) ||
    Boolean(filters.positionIds?.length),
)
const hasPartialDateRange = computed(() => Boolean(filters.startDate) !== Boolean(filters.endDate))
const hasInvalidDateRange = computed(() =>
  Boolean(filters.startDate && filters.endDate && filters.startDate > filters.endDate),
)
const canSubmit = computed(
  () =>
    !isSubmitting.value &&
    !hasPartialDateRange.value &&
    !hasInvalidDateRange.value &&
    (filters.deleteAll ? confirmDeleteAll.value : hasFilters.value),
)

function reset() {
  Object.assign(filters, {
    startDate: '',
    endDate: '',
    employeeIds: [],
    positionIds: [],
    deleteAll: false,
  })
  confirmDeleteAll.value = false
  isSubmitting.value = false
}

function close() {
  if (!isSubmitting.value) emit('close')
}

function toggleEmployee(id: string) {
  const selected = filters.employeeIds ?? []
  filters.employeeIds = selected.includes(id)
    ? selected.filter((employeeId) => employeeId !== id)
    : [...selected, id]
}

function togglePosition(id: number) {
  const selected = filters.positionIds ?? []
  filters.positionIds = selected.includes(id)
    ? selected.filter((positionId) => positionId !== id)
    : [...selected, id]
}

async function submit() {
  if (!canSubmit.value) return

  isSubmitting.value = true
  try {
    const result = await shiftStore.deleteManyShifts(filters)
    emit('deleted', result.deletedCount)
    reset()
    emit('close')
  } catch (error: unknown) {
    isSubmitting.value = false
    const requestError = error as RequestError
    errorModal.showError(requestError.data?.message || requestError.message || 'error.shift.delete')
  }
}

watch(
  () => filters.deleteAll,
  (deleteAll) => {
    if (!deleteAll) confirmDeleteAll.value = false
  },
)
</script>

<template>
  <Modal :model-value="modelValue" @update:model-value="(value) => !value && close()">
    <Loading v-if="isSubmitting" class="min-h-[360px] w-full sm:w-[560px]" />
    <form
      v-else
      class="flex max-h-[calc(100dvh-1rem)] w-full flex-col gap-5 overflow-y-auto p-4 pt-14 sm:w-[560px] sm:p-6 sm:pt-8"
      @submit.prevent="submit"
    >
      <h2 class="pr-10 text-xl font-bold">{{ $t('ui.bulkDelete.title') }}</h2>
      <p class="text-sm text-[var(--text-muted)]">{{ $t('ui.bulkDelete.description') }}</p>

      <label class="flex items-center gap-3 rounded-md border border-[var(--border-main)] p-3">
        <input v-model="filters.deleteAll" type="checkbox" class="h-5 w-5" />
        <span class="font-medium">{{ $t('ui.bulkDelete.deleteAll') }}</span>
      </label>

      <fieldset :disabled="filters.deleteAll" class="flex flex-col gap-5 disabled:opacity-45">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label class="flex flex-col gap-1 text-sm">
            <span>{{ $t('ui.startDate') }}</span>
            <input
              v-model="filters.startDate"
              type="date"
              class="min-h-11 rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] p-2 text-[var(--input-text)]"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span>{{ $t('ui.endDate') }}</span>
            <input
              v-model="filters.endDate"
              type="date"
              class="min-h-11 rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] p-2 text-[var(--input-text)]"
            />
          </label>
        </div>
        <p v-if="hasPartialDateRange" class="text-sm text-[var(--btn-delete-text)]">
          {{ $t('error.form.dateRangeRequired') }}
        </p>
        <p v-else-if="hasInvalidDateRange" class="text-sm text-[var(--btn-delete-text)]">
          {{ $t('error.form.startOlderEnd') }}
        </p>

        <div class="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <fieldset class="min-w-0">
            <legend class="mb-2 font-medium">{{ $t('ui.employees') }}</legend>
            <div class="max-h-40 overflow-y-auto rounded-md border border-[var(--border-main)] p-2">
              <label
                v-for="employee in employeeStore.employees"
                :key="employee.id"
                class="flex min-h-10 items-center gap-2 px-1"
              >
                <input
                  type="checkbox"
                  :checked="filters.employeeIds?.includes(employee.id)"
                  class="h-5 w-5"
                  @change="toggleEmployee(employee.id)"
                />
                <span class="min-w-0 truncate">{{ employee.surname }} {{ employee.name }}</span>
              </label>
            </div>
          </fieldset>
          <fieldset class="min-w-0">
            <legend class="mb-2 font-medium">{{ $t('ui.positions') }}</legend>
            <div class="max-h-40 overflow-y-auto rounded-md border border-[var(--border-main)] p-2">
              <label
                v-for="position in positionStore.positions"
                :key="position.id"
                class="flex min-h-10 items-center gap-2 px-1"
              >
                <input
                  type="checkbox"
                  :checked="filters.positionIds?.includes(position.id)"
                  class="h-5 w-5"
                  @change="togglePosition(position.id)"
                />
                <span class="min-w-0 truncate">{{ position.name }}</span>
              </label>
            </div>
          </fieldset>
        </div>
      </fieldset>

      <label
        v-if="filters.deleteAll"
        class="flex items-start gap-3 rounded-md border border-[var(--btn-delete-text)] p-3"
      >
        <input v-model="confirmDeleteAll" type="checkbox" class="mt-0.5 h-5 w-5" />
        <span class="text-sm">{{ $t('ui.bulkDelete.confirmAll') }}</span>
      </label>

      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          class="min-h-11 rounded-md bg-[var(--btn-bg)] px-4 py-2 text-[var(--btn-text)]"
          @click="close"
        >
          {{ $t('btn.cancel') }}
        </button>
        <button
          type="submit"
          :disabled="!canSubmit"
          class="min-h-11 rounded-md bg-[var(--btn-bg)] px-4 py-2 text-[var(--btn-delete-text)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {{ $t('ui.bulkDelete.submit') }}
        </button>
      </div>
    </form>
  </Modal>
  <ErrorModalContent :error="errorModal.error.value" @close="errorModal.close" />
</template>
