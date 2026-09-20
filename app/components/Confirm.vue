<script setup lang="ts">
import Modal from './Modal.vue'

const props = defineProps<{
  modelValue: boolean
  message: string
  isLoading: boolean
  submitText?: string
  cancelText?: string
}>()

const isClosing = ref(false)

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'close'): void
  (e: 'submit'): void
}>()

function onUpdateModelValue(value: boolean) {
  emit('update:modelValue', value)

  if (!value) {
    emit('close')
  }
}

function handleCancel() {
  emit('close')
}

async function handleSubmit() {
  emit('submit')
  await nextTick()
  isClosing.value = true
  if(!props.isLoading) {
    emit('close')
  }
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    isClosing.value = false 
  }
})

</script>

<template>
  <Modal
    :model-value="modelValue"
    @update:model-value="onUpdateModelValue"
  >
  <Loading
    v-if="isLoading || isClosing"
    class="min-h-[180px] w-full"
  />
  <template v-else>
    <div
      class="flex flex-col justify-center items-center max-w-[500px] h-[175px] mt-4 px-auto">
      <p class="text-lg text-center font-bold p-3 {{ isLoading ? 'opacity-50' : '' }}"> {{ message }}</p>
      <div class="flex justify-end gap-4 mt-6">
        <button
          @click="handleCancel"
          class="px-4 py-2 rounded-md bg-[var(--btn-bg)] text-[var(--btn-text)] hover:bg-[var(--btn-hover)] {{ isLoading ? 'opacity-50 cursor-not-allowed' : '' }}"
        >
          {{ cancelText ? $t(cancelText) : $t('ui.cancel') }}
        </button>
        <button
          @click="handleSubmit"
          class="px-4 py-2 rounded-md bg-[var(--btn-bg)] text-[var(--btn-text)] hover:text-[var(--btn-delete-hover-bg)] {{ isLoading ? 'opacity-50 cursor-not-allowed' : '' }}"
        >
          {{ submitText ? $t(submitText) : $t('ui.confirm') }}
        </button>
      </div>
    </div>
    </template>
  </Modal>
</template>