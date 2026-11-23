<script setup lang="ts">
const props = defineProps<{
  title: string
  fields?: readonly Field[]
  selects?: readonly Select[]
  modelValue: Record<string, unknown>
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

type Select = {
  key: string
  placeholder: string
  placeholderValue?: string | number
  disabledOption: string
  selectOption: {
    label: string
    value: string | number
  }[]
  required?: boolean
  disabled?: boolean
}

type Field = {
  key: string
  type: string
  placeholder: string
  required?: boolean
  disabled?: boolean
}

function getDeepValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (!acc || typeof acc !== 'object' || !(part in acc)) return undefined
    return (acc as Record<string, unknown>)[part]
  }, obj)
}

function setDeepValue(obj: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split('.')
  const last = parts.pop()!
  let deepParent = obj

  for (const part of parts) {
    const current = deepParent[part]
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
      deepParent[part] = {}
    }
    deepParent = deepParent[part] as Record<string, unknown>
  }

  deepParent[last] = value
}

function updateField(key: string, value: string) {
  setDeepValue(props.modelValue, key, value)
}

function onSelectChange(event: Event, select: Select) {
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

const { formatDate } = useUserDisplayPreferences()
const formattedDate = computed(() => (props.date ? formatDate(props.date) : ''))
</script>

<template>
  <div
    class="flex max-h-[calc(100dvh-1rem)] flex-col items-center justify-center gap-4 overflow-y-auto p-4 pt-12 sm:max-h-[calc(100dvh-3rem)] sm:p-6 sm:pt-8"
  >
    <Loading v-if="isLoading" class="min-h-[180px] w-full" />
    <template v-else>
      <h2 class="w-full p-1 text-center text-xl font-bold">
        {{ $t(title) + ' ' + (formattedDate ? formattedDate : '') }}
      </h2>
      <form class="flex w-full flex-col gap-4" @submit.prevent="handleSubmit">
        <template v-if="fields">
          <template v-for="field in fields" :key="field.key">
            <DateInput
              v-if="field.type === 'date'"
              :model-value="String(getDeepValue(modelValue, field.key) ?? '')"
              :placeholder="$t(field.placeholder)"
              :required="field.required ?? false"
              :disabled="field.disabled ?? false"
              @update:model-value="updateField(field.key, $event)"
            />
            <input
              v-else
              :value="getDeepValue(modelValue, field.key) ?? ''"
              :type="field.type"
              :placeholder="$t(field.placeholder)"
              :required="field.required ?? false"
              :disabled="field.disabled ?? false"
              class="min-h-11 rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] p-2 pl-3 text-[var(--input-text)]"
              @input="updateField(field.key, ($event.target as HTMLInputElement).value)"
            />
          </template>
        </template>
        <div v-if="selects" class="flex w-full flex-col gap-4">
          <select
            v-for="select in selects"
            :key="select.key"
            :value="getDeepValue(modelValue, select.key) ?? ''"
            :required="select.required"
            :disabled="select.disabled ?? false"
            class="min-h-11 rounded border border-[var(--input-border)] bg-[var(--input-bg)] pl-3 text-[var(--input-text)] disabled:cursor-not-allowed disabled:opacity-50"
            @input="onSelectChange($event, select)"
          >
            <option disabled :value="select.placeholderValue ?? ''">
              {{ $t(select.placeholder) }}
            </option>
            <option v-for="o in select.selectOption" :key="String(o.value)" :value="o.value">
              {{ o.label }}
            </option>
          </select>
        </div>
        <slot name="before-actions" />
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <div class="flex gap-2">
            <button
              type="button"
              class="px-4 py-2 rounded-md bg-[var(--btn-bg)] text-[var(--btn-text)] hover:text-[var(--text-soft)] {{ isLoading ? 'opacity-50 cursor-not-allowed' : '' }}"
              :disabled="isLoading"
              @click="handleCancel"
            >
              {{ $t('btn.cancel') }}
            </button>
            <button
              v-if="props.delete"
              type="button"
              class="px-4 py-2 rounded-md bg-[var(--btn-bg)] text-[var(--btn-text)] hover:text-[var(--btn-delete-hover-bg)] {{ isLoading ? 'opacity-50 cursor-not-allowed' : '' }}"
              :disabled="isLoading"
              @click="handleDelete"
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
