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
    <div class="w-[700px] h-[400px]">
      <section class="inline-flex justify-center text-center font-bold text-lg items-center py-3 w-full">
        <form
          class="flex justify-center gap-2"
          @submit.prevent="handleSubmit">
          <input
          :disabled=isDisableName
          v-model="organizationName"
          class="text-center rounded px-2 transition-all outline-none"
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
            bg-[url('/assets/images/edit.png')] w-7 h-7 bg-cover bg-center invert-[1] [html.light_&]:invert-0
          "/>
        </form>
      </section>
      <hr>
        <div class="flex justify-around h-[60%] overflow-auto mt-2">
          <div class="flex flex-col items-center border rounded w-[30%] h-full">
            <h4 class="pb-2">{{ $t('ui.employees') }}</h4>
            <ul>
              <li
                v-for="emp in employeeStore.options"
                class="pl-2 cursor-pointer pb-2"
                @click="openEditEmployeeForm(emp.value)"
              >
                <p>{{ emp.label }}</p>
              </li>
            </ul>
          </div>
          <div class="flex flex-col items-center border rounded w-[30%] h-full">
            <h4 class="pb-2">{{ $t('ui.positions') }}</h4>
            <ul>
              <li
                v-for="pos in positionStore.optionsFull"
                class="pl-2 cursor-pointer pb-2"
                @click="openEditPositionForm(pos.value)"
              >
                {{ pos.label }}
              </li>
            </ul>
          </div>
          <div class="flex flex-col items-center border rounded w-[30%] h-full">
            <h4>{{ $t('ui.users') }}</h4>
            <ol>
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