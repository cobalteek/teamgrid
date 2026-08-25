<script setup lang="ts">
import Modal from './Modal.vue'
import {isValidName} from '../../shared/utils/validation'
import { listen } from 'node:quic';

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
// const rolesStore = useRoleStore()
const errorModal = useErrorModal()

const organizationName = ref('')
const isDisableName = ref(true)

function onUpdateModelValue(value: boolean) {
  emit('update:modelValue', value)

  if (!value) {
    if(organizationName.value !== organizationStore.currentOrganization?.name) {
      console.log('sosiska')
    }
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
    <div class="w-[500px] h-[300px]">
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
            bg-[url('/assets/images/edit.png')] w-7 h-7 bg-cover bg-center invert
          "/>
        </form>
      </section>
      <hr>
        <div class="grid grid-cols-3 gap-3 w-full max-w-4xl mx-auto justify-items-center">
          <div class="border rounded h-full w-full">
            <h4>{{ $t('ui.employees') }}</h4>
            <li>
              <ol
                v-for="emp in employeeStore.options"
              >
                {{ emp.label }}
              </ol>
            </li>
          </div>
          <div>
            <h4>{{ $t('ui.positions') }}</h4>

          </div>
          <div>
            <h4>{{ $t('ui.roles') }}</h4>
          </div>
        </div>
    </div>
  </Modal>
</template>