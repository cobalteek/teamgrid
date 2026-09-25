<script setup lang="ts">
import Modal from './Modal.vue'

const props = defineProps<{
  modelValue: boolean
  message: string
  isLoading: boolean
  submitText?: string
  cancelText?: string
}>()

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

function handleSubmit() {
  emit('submit')
}
</script>

<template>
  <Modal :model-value="modelValue" @update:model-value="onUpdateModelValue">
    <Loading v-if="isLoading" class="min-h-[180px] w-full" />
    <template v-else>
      <div class="px-auto mt-4 flex h-[175px] max-w-[500px] flex-col items-center justify-center">
        <p class="text-lg text-center font-bold p-3 {{ isLoading ? 'opacity-50' : '' }}">
          {{ message }}
        </p>
        <div class="mt-6 flex justify-end gap-4">
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
