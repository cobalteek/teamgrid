<script setup lang="ts">
import Modal from './Modal.vue'
import { useUserStore } from '~/stores/user'
import { useOrganizationStore } from '~/stores/organization'
import { useEmployeeStore } from '~/stores/employee'
import { usePositionStore } from '~/stores/position'
import { isValidName } from '~~/shared/utils/validation'
import EditPositionForm from './EditPositionForm.vue'
import EditEmployeeForm from './EditEmployeeForm.vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'close'): void
}>()

const organizationStore = useOrganizationStore()
const employeeStore = useEmployeeStore()
const positionStore = usePositionStore()
const userStore = useUserStore()

const errorModal = useErrorModal()

const organizationName = ref('')
const isDisableName = ref(true)
const isOpenEditPositionForm = ref(false)
const isOpenEditEmployeeForm = ref(false)

const posId = ref(0)
const empId = ref('')

function onUpdateModelValue(value: boolean) {
  emit('update:modelValue', value)

  if (!value) {
    isDisableName.value = true
    emit('close')
  }
}

async function handleSubmit() {
  isDisableName.value = true
  if (!isValidName(organizationName.value)) {
    errorModal.showError('error.invalidOrganizationName')
    return
  }
  try {
    await organizationStore.changeName(organizationName.value)
    isDisableName.value = true
  } catch (e) {
    console.log(e)
  }
}

function openEditPositionForm(positionId: number) {
  posId.value = positionId
  isOpenEditPositionForm.value = true
}

function openEditEmployeeForm(employeeId: string) {
  empId.value = employeeId
  isOpenEditEmployeeForm.value = true
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      organizationName.value = organizationStore.currentOrganization?.name ?? ''
    }
  },
)
</script>

<template>
  <Modal :model-value="modelValue" @update:model-value="onUpdateModelValue">
    <div
      class="flex max-h-[calc(100dvh-1rem)] w-full flex-col gap-4 overflow-y-auto p-4 pt-12 sm:max-h-[calc(100dvh-3rem)] sm:w-[700px] sm:p-6 sm:pt-8"
    >
      <section class="flex w-full flex-col items-center gap-3 text-center">
        <form
          class="flex w-full flex-col gap-3 sm:flex-row sm:pr-14"
          @submit.prevent="handleSubmit"
        >
          <input
            v-model="organizationName"
            :disabled="isDisableName"
            class="min-h-11 min-w-0 flex-1 rounded-md border bg-[var(--input-bg)] p-2 pl-3 text-center text-xl font-bold text-[var(--input-text)] transition-all outline-none"
            :class="
              isDisableName
                ? 'border-transparent'
                : 'border-[var(--input-border)] focus:border-[var(--btn-save-hover-text)]'
            "
          />
          <div class="flex gap-2 sm:shrink-0">
            <button
              type="button"
              class="flex min-h-11 flex-1 items-center justify-center rounded-md border border-[var(--border-main)] bg-[var(--btn-bg)] px-4 text-[var(--btn-text)] transition duration-100 active:scale-95 sm:w-11 sm:flex-none sm:px-0"
              :aria-label="$t('btn.edit')"
              @click="isDisableName = false"
            >
              <span
                aria-hidden="true"
                class="h-5 w-5 bg-[url('/assets/images/edit.png')] bg-cover bg-center invert-[1] [html.light_&]:invert-0"
              />
            </button>
            <button
              v-if="!isDisableName"
              type="submit"
              class="min-h-11 flex-1 rounded-md bg-[var(--btn-bg)] px-4 py-2 text-[var(--btn-text)] transition hover:text-[var(--btn-save-hover-text)] sm:flex-none"
            >
              {{ $t('btn.save') }}
            </button>
          </div>
        </form>
      </section>
      <div class="grid min-h-0 grid-cols-1 gap-3 sm:grid-cols-3">
        <div
          class="flex min-h-[170px] flex-col overflow-hidden rounded-md border border-[var(--border-main)] bg-[var(--input-bg)] sm:h-[300px]"
        >
          <h3
            class="shrink-0 border-b border-[var(--border-main)] px-3 py-2 text-center text-lg font-bold"
          >
            {{ $t('ui.employees') }}
          </h3>
          <ul class="min-h-0 w-full flex-1 overflow-y-auto p-2">
            <li
              v-for="emp in employeeStore.options"
              :key="emp.value"
              class="cursor-pointer rounded-md px-3 py-2 text-[var(--input-text)] transition hover:bg-[var(--btn-bg)]"
              @click="openEditEmployeeForm(emp.value)"
            >
              <p>{{ emp.label }}</p>
            </li>
          </ul>
        </div>
        <div
          class="flex min-h-[170px] flex-col overflow-hidden rounded-md border border-[var(--border-main)] bg-[var(--input-bg)] sm:h-[300px]"
        >
          <h3
            class="shrink-0 border-b border-[var(--border-main)] px-3 py-2 text-center text-lg font-bold"
          >
            {{ $t('ui.positions') }}
          </h3>
          <ul class="min-h-0 w-full flex-1 overflow-y-auto p-2">
            <li
              v-for="pos in positionStore.optionsFull"
              :key="pos.value"
              class="cursor-pointer rounded-md px-3 py-2 text-[var(--input-text)] transition hover:bg-[var(--btn-bg)]"
              @click="openEditPositionForm(pos.value)"
            >
              {{ pos.label }}
            </li>
          </ul>
        </div>
        <div
          class="flex min-h-[170px] flex-col overflow-hidden rounded-md border border-[var(--border-main)] bg-[var(--input-bg)] text-center sm:h-[300px]"
        >
          <h3 class="shrink-0 border-b border-[var(--border-main)] px-3 py-2 text-lg font-bold">
            {{ $t('ui.users') }}
          </h3>
          <ol class="min-h-0 w-full flex-1 overflow-y-auto p-2">
            <li
              v-for="user in userStore.organizationOptions"
              :key="user.value"
              class="rounded-md px-3 py-2 text-[var(--input-text)]"
            >
              {{ user.label }}
            </li>
          </ol>
        </div>
      </div>
    </div>
  </Modal>
  <EditPositionForm
    :model-value="isOpenEditPositionForm"
    :position-id="posId"
    @close="isOpenEditPositionForm = false"
  />
  <EditEmployeeForm
    :model-value="isOpenEditEmployeeForm"
    :employee-id="empId"
    @close="isOpenEditEmployeeForm = false"
  />
  <ErrorModalContent
    :error="errorModal.error.value"
    class="top-1/4 h-[200px] w-[300px]"
    @close="errorModal.close"
  />
</template>
