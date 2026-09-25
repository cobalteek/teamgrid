<script setup lang="ts">
const props = defineProps<{
  error: {
    modelValue: boolean
    type: 'error' | 'info'
    text: string
  }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'close'): void
}>()

const head = computed(() => (props.error.type === 'error' ? 'Error' : 'Information'))

function onUpdateModelValue(value: boolean) {
  emit('update:modelValue', value)

  if (!value) {
    emit('close')
  }
}
</script>

<template>
  <Modal
    :model-value="error.modelValue"
    @update:model-value="onUpdateModelValue"
    class="fixed top-1/2 left-1/2 h-[200px] w-[320px] -translate-x-1/2 -translate-y-1/2"
  >
    <div class="mt-4 ml-3 inline-flex h-full w-full justify-start gap-5">
      <div class="row-start-1 mt-9 flex items-center justify-center">
        <div
          v-if="error.type == 'error'"
          class="h-[30px] w-[30px] rounded-full border border-[var(--bg-main)] bg-[var(--bg-error)] text-center text-xl leading-tight"
        >
          !
        </div>
        <div
          v-if="error.type == 'info'"
          class="text-semibold h-[30px] w-[30px] rounded-full border border-[var(--bg-main)] bg-[var(--bg-info)] text-center text-xl leading-tight text-black"
        >
          i
        </div>
      </div>
      <div class="my-auto w-[199px] text-center">
        <div class="mr-4 text-xl leading-tight font-semibold">
          {{ head }}
        </div>
        <div class="mx-auto mt-3 font-mono">
          {{ $t(error.text) }}
        </div>
      </div>
    </div>
  </Modal>
</template>
