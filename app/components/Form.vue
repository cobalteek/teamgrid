<script setup lang="ts" generic="T extends Record<string, unknown>">
const props = defineProps<{
  title: string
  fields?: readonly Field<T>[]
  selects?: readonly Select<T>[]
  modelValue: T
  date?: Date
  submitBtnName: string
  isLoading: boolean
  delete?: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: []
  delete: []
}>()

type Select<T> = {
  key: string
  placeholder: string
  disabledOption: string
  selectOption: {
    label: string
    value: any
  }[]
}

type Field<T> = {
  key: string
  type: string
  placeholder: string
}

function getDeepValue(obj: any, path: string) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}

function setDeepValue(obj: any, path: string, value: any) {
  const parts = path.split('.')
  const last = parts.pop()!
  const deepParent = parts.reduce((acc, part) => {
    if (!acc[part]) acc[part] = {}
    return acc[part]
  }, obj)
  deepParent[last] = value
}

function updateField(key: string, value: string) {
  setDeepValue(props.modelValue, key, value)
}

function onSelectChange(event: Event, select: Select<T>) {
  const value = (event.target as HTMLSelectElement).value

  const option = select.selectOption.find((option) => String(option.value) === value)

  if (option) {
    setDeepValue(props.modelValue, select.key, option.value)
  }
}

const handleCancel = () => {
  emit('close')
}

const handleSubmit = () => {
  emit('submit')
}

const handleDelete = () => {
  emit('delete')
}

const formatedDate = ref()

if (props.date) {
  formatedDate.value = new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
  }).format(props.date)
} else {
  formatedDate.value = ''
}
</script>

<template>
  <div
    class="flex max-h-[calc(100dvh-1rem)] flex-col items-center justify-center gap-4 overflow-y-auto p-4 pt-12 sm:max-h-[calc(100dvh-3rem)] sm:p-6 sm:pt-8"
  >
    <Loading v-if="isLoading" class="min-h-[180px] w-full" />
    <template v-else>
      <h2 class="w-full p-1 text-center text-xl font-bold">
        {{ $t(title) + ' ' + (formatedDate ? formatedDate : '') }}
      </h2>
      <form @submit.prevent="handleSubmit" class="flex w-full flex-col gap-4">
        <input
          v-if="fields"
          v-for="field in fields"
          :key="field.key"
          :value="getDeepValue(modelValue, field.key) ?? ''"
          @input="updateField(field.key, ($event.target as HTMLInputElement).value)"
          :type="field.type"
          :placeholder="$t(field.placeholder)"
          class="min-h-11 rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] p-2 pl-3 text-[var(--input-text)]"
        />
        <div v-if="selects" class="flex w-full flex-col gap-4">
          <select
            v-for="select in selects"
            :key="select.key"
            :value="getDeepValue(modelValue, select.key) ?? ''"
            @input="onSelectChange($event, select)"
            class="min-h-11 rounded border border-[var(--input-border)] bg-[var(--input-bg)] pl-3 text-[var(--input-text)]"
          >
            <option disabled value="">
              {{ $t(select.placeholder) }}
            </option>
            <option v-for="o in select.selectOption" :key="String(o.value)" :value="o.value">
              {{ o.label }}
            </option>
          </select>
        </div>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <div class="flex gap-2">
            <button
              type="button"
              @click="handleCancel"
              class="px-4 py-2 rounded-md bg-[var(--btn-bg)] text-[var(--btn-text)] hover:text-[var(--btn-hover)] {{ isLoading ? 'opacity-50 cursor-not-allowed' : '' }}"
              :disabled="isLoading"
            >
              {{ $t('btn.cancel') }}
            </button>
            <button
              v-if="props.delete"
              type="button"
              @click="handleDelete"
              class="px-4 py-2 rounded-md bg-[var(--btn-bg)] text-[var(--btn-text)] hover:text-[var(--btn-delete-hover-bg)] {{ isLoading ? 'opacity-50 cursor-not-allowed' : '' }}"
              :disabled="isLoading"
            >
              {{ $t('btn.delete') }}
            </button>
          </div>
          <button
            type="submit"
            class="px-4 py-2 rounded-md bg-[var(--btn-bg)] text-[var(--btn-text)] hover:text-[var(--btn-save-hover-text)] {{ isLoading ? 'opacity-50 cursor-not-allowed' : '' }}"
            :disabled="isLoading"
          >
            {{ $t(submitBtnName) }}
          </button>
        </div>
      </form>
    </template>
  </div>
</template>
