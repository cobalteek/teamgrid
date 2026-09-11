<script setup lang="ts">
import Modal from './Modal.vue'
import { useUserStore } from '~/stores/user';
import { useOrganizationStore } from '~/stores/organization';
import { useEmployeeStore } from '~/stores/employee';
import { usePositionStore } from '~/stores/position';
import {isValidName} from '~~/shared/utils/validation'
import EditPositionForm from './EditPositionForm.vue';
import EditEmployeeForm from './EditEmployeeForm.vue';

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
  if(!isValidName(organizationName.value)) {
      errorModal.showError('error.invalidOrganizationName')
      return
    }
  try {
    await organizationStore.changeName(organizationName.value)
    isDisableName.value = true
  } catch(e) {
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
      organizationName.value =
        organizationStore.currentOrganization?.name ?? ''
    }
  }
)


</script>

<template>
  <Modal
    :model-value="modelValue"
    @update:model-value="onUpdateModelValue"
  >
    <div class="max-h-[calc(100dvh-1rem)] w-[min(700px,calc(100vw-1rem))] overflow-y-auto p-3 sm:h-[400px] sm:p-0">
      <section class="flex w-full items-center justify-center py-3 text-center text-lg font-bold">
        <form
          class="flex w-full justify-center gap-2 sm:w-auto"
          @submit.prevent="handleSubmit">
          <input
          :disabled=isDisableName
          v-model="organizationName"
          class="min-h-11 min-w-0 flex-1 rounded px-2 text-center transition-all outline-none sm:min-h-0 sm:flex-none"
          :class="isDisableName 
            ? 'border border-transparent'
            : 'border border-gray-400 focus:border-blue-500'"
        />
        <button
          type="button"
          @click="isDisableName = false"
          class="
            transition
            transition
            duration-100
            active:scale-90
            bg-[url('/assets/images/edit.png')] min-h-11 min-w-11 w-11 bg-cover bg-center invert-[1] [html.light_&]:invert-0 sm:min-h-0 sm:min-w-0 sm:w-7 sm:h-7
          "/>
        </form>
      </section>
      <hr>
        <div class="mt-2 grid grid-cols-1 gap-3 sm:h-[300px] sm:grid-cols-3 sm:justify-around">
          <div class="flex min-h-[150px] flex-col items-center overflow-hidden rounded border sm:h-[300px]">
            <h3 class="pb-2 shrink-0 text-lg">{{ $t('ui.employees') }}</h3>
            <ul class="w-full flex-1 overflow-y-auto min-h-0">
              <li
                v-for="emp in employeeStore.options"
                class="pl-2 cursor-pointer pb-2"
                @click="openEditEmployeeForm(emp.value)"
              >
                <p>{{ emp.label }}</p>
              </li>
            </ul>
          </div>
          <div class="flex min-h-[150px] flex-col items-center overflow-hidden rounded border sm:h-[300px]">
            <h3 class="pb-2 shrink-0 text-lg">{{ $t('ui.positions') }}</h3>
            <ul class="w-full flex-1 overflow-y-auto min-h-0">
              <li
                v-for="pos in positionStore.optionsFull"
                class="pl-2 cursor-pointer pb-2"
                @click="openEditPositionForm(pos.value)"
              >
                {{ pos.label }}
              </li>
            </ul>
          </div>
          <div class="flex min-h-[150px] flex-col items-center overflow-hidden rounded border text-center sm:h-[300px]">
            <h3 class="pb-2 shrink-0 text-lg">{{ $t('ui.users') }}</h3>
            <ol class="w-full flex-1 overflow-y-auto min-h-0">
              <li
                v-for="user in userStore.organizationOptions"
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
    @close="errorModal.close"
    class="w-[300px] h-[200px] top-1/4"
  />
</template>
