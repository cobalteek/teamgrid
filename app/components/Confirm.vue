<script setup lang="ts">
import Modal from './Modal.vue'

const props = defineProps<{
  modelValue: boolean
  message: string
  isLoading: boolean
  submitText?: string
  cancelText?: string
  checkboxes?: Checkbox[]
}>()

type Checkbox = {
  text: string
  required: boolean
  model: boolean
}

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'update:checkbox', v: boolean): void
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
  onUpdateModelValue(false)
}

function setValue(value: boolean) {
  emit('update:checkbox', value)
}
</script>

<template>
  <Modal :model-value="modelValue" @update:model-value="onUpdateModelValue">
    <Loading v-if="isLoading" class="min-h-[180px] w-full" />
    <template v-else>
      <div
        class="px-auto mt-4 flex max-h-[250px] min-h-[160px] max-w-[500px] flex-col items-center justify-center"
      >
        <p class="text-lg text-center font-bold p-3 {{ isLoading ? 'opacity-50' : '' }}">
          {{ message }}
        </p>
        <label
          v-for="checkbox in checkboxes"
          class="mt-2 flex w-full max-w-[320px] cursor-pointer items-start gap-3 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] p-3 text-left text-sm leading-5 transition hover:border-[var(--text-blue)]"
        >
          <input
            type="checkbox"
            :required="checkbox.required"
            :checked="checkbox.model === true"
            class="peer sr-only"
            @change="setValue(($event.target as HTMLInputElement).checked)"
          />
          <span
            aria-hidden="true"
            class="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-[var(--input-border)] bg-[var(--bg-modal)] transition peer-checked:border-[var(--btn-bg)] peer-checked:bg-[var(--btn-bg)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--text-blue)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--bg-modal)] after:h-2 after:w-3 after:rotate-[-45deg] after:border-b-2 after:border-l-2 after:border-[var(--btn-text)] after:opacity-0 after:transition-opacity peer-checked:after:opacity-100"
          />
          <span class="text-red-500 select-none">
            {{ $t(checkbox.text) }}
          </span>
        </label>
        <div class="my-3 flex justify-end gap-4">
          <button
            @click="handleCancel"
            class="px-4 py-2 rounded-md bg-[var(--btn-bg)] text-[var(--btn-text)] hover:text-[var(--text-soft)] {{ isLoading ? 'opacity-50 cursor-not-allowed' : '' }}"
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
