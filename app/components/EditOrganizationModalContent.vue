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
const organizationDescription = ref('')
const isDisableName = ref(true)
const isDisableDescription = ref(true)
const isOpenEditPositionForm = ref(false)
const isOpenEditEmployeeForm = ref(false)
const isAddEmployeeModalOpen = ref(false)
const isAddPositionFormOpen = ref(false)
const isOpenUser = ref(false)

const posId = ref(0)
const empId = ref('')
const userId = ref('')

function onUpdateModelValue(value: boolean) {
  emit('update:modelValue', value)

  if (!value) {
    isDisableName.value = true
    isDisableDescription.value = true
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

async function handleDescriptionSubmit() {
  isDisableDescription.value = true

  try {
    await organizationStore.changeDescription(organizationDescription.value)
  } catch {
    isDisableDescription.value = false
    errorModal.showError('error.organization.update')
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

function openEditUser(id: string) {
  userId.value = id
  isOpenUser.value = true
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      organizationName.value = organizationStore.currentOrganization?.name ?? ''
      organizationDescription.value = organizationStore.currentOrganization?.description ?? ''
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
      <section class="flex w-full flex-col gap-2">
        <h3 class="text-sm font-semibold text-[var(--text-soft)]">
          {{ $t('ui.organizationDescription') }}
        </h3>
        <form
          class="flex w-full flex-col gap-2 sm:flex-row"
          @submit.prevent="handleDescriptionSubmit"
        >
          <textarea
            v-model="organizationDescription"
            :disabled="isDisableDescription"
            rows="3"
            maxlength="500"
            :placeholder="$t('placeholder.organizationDescription')"
            class="min-h-20 min-w-0 flex-1 resize-y rounded-md border bg-[var(--input-bg)] p-3 text-[var(--input-text)] transition-all outline-none"
            :class="
              isDisableDescription
                ? 'border-transparent'
                : 'border-[var(--input-border)] focus:border-[var(--btn-save-hover-text)]'
            "
          />
          <div class="flex gap-2 sm:shrink-0 sm:flex-col">
            <button
              type="button"
              class="flex min-h-11 flex-1 items-center justify-center rounded-md border border-[var(--border-main)] bg-[var(--btn-bg)] px-4 text-[var(--btn-text)] transition duration-100 active:scale-95 sm:w-11 sm:flex-none sm:px-0"
              :aria-label="$t('btn.edit')"
              @click="isDisableDescription = false"
            >
              <span
                aria-hidden="true"
                class="h-5 w-5 bg-[url('/assets/images/edit.png')] bg-cover bg-center invert-[1] [html.light_&]:invert-0"
              />
            </button>
            <button
              v-if="!isDisableDescription"
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
            class="flex shrink-0 items-center justify-between border-b border-[var(--border-main)] px-3 py-2 text-center text-lg font-bold"
          >
            {{ $t('ui.employees') }}
            <span
              class="text-bold cursor-pointer rounded-xl border px-2 text-xl"
              @click="isAddEmployeeModalOpen = true"
              >+</span
            >
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
            class="flex shrink-0 items-center justify-between border-b border-[var(--border-main)] px-3 py-2 text-center text-lg font-bold"
          >
            {{ $t('ui.positions') }}
            <span
              class="text-bold cursor-pointer rounded-xl border px-2 text-xl"
              @click="isAddPositionFormOpen = true"
              >+</span
            >
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
              class="cursor-pointer rounded-md px-3 py-2 text-[var(--input-text)] hover:bg-[var(--btn-bg)]"
              @click="openEditUser(user.value)"
            >
              {{ user.label }}
            </li>
          </ol>
        </div>
      </div>
    </div>
  </Modal>
  <AddEmployeeModalContent
    :model-value="isAddEmployeeModalOpen"
    @close="isAddEmployeeModalOpen = false"
  />
  <AddPositionForm :model-value="isAddPositionFormOpen" @close="isAddPositionFormOpen = false" />
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
  <EditUserInOrganization :model-value="isOpenUser" :user-id="userId" @close="isOpenUser = false" />
  <ErrorModalContent
    :error="errorModal.error.value"
    class="top-1/4 h-[200px] w-[300px]"
    @close="errorModal.close"
  />
</template>
