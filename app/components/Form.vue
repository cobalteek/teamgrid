<script setup lang="ts" generic="T extends Record<string, unknown>">
const props = defineProps<{
  title: string,
  fields?: readonly Field<T>[];
  selects?: readonly Select<T>[];
  modelValue: T;
  date?: Date
  submitBtnName: string;
}>()

const emit = defineEmits<{
  close: [],
  submit: []
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

function updateField(
  key: string,
  value: string
) {
  setDeepValue(props.modelValue, key, value)
}

function onSelectChange(
  event: Event,
  select: Select<T>
) {
  const value = (event.target as HTMLSelectElement).value

  const option = select.selectOption.find(
    option => String(option.value) === value
  )

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

const formatedDate = ref()

if(props.date) {
  formatedDate.value = new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short'
  }).format(props.date)
} else {
  formatedDate.value = ''
}
</script>

<template>
  <div class="flex flex-col justify-center items-center gap-4 p-4">
    <h2 class="text-xl font-bold p-2 pt-6">{{ $t(title) + " " + (formatedDate ? formatedDate : '')}}</h2>
    <form @submit.prevent="handleSubmit" class="flex flex-col gap-4 w-full">
      <input
        v-if="fields"
        v-for="field in fields"
        :key="field.key"
        :value="getDeepValue(modelValue, field.key) ?? ''"
        @input="updateField(
          field.key,
          ($event.target as HTMLInputElement).value
        )"
        :type="field.type"
        :placeholder="$t(field.placeholder)"
        class="pl-2 p-1 rounded-md active:border-gray-200 text-[var(--input-text)] bg-[var(--input-bg)]"
        />
      <div
        v-if="selects"
        class="flex flex-col gap-4 w-full"
      >
        <select
        v-for="select in selects"
        :key="select.key"
        :value="getDeepValue(modelValue, select.key) ?? ''"
        @input="onSelectChange($event, select)"
        class="border-1 rounded pl-2"
      >
        <option disabled value="">
          {{ $t(select.placeholder) }}
        </option>
        <option
          v-for="o in select.selectOption"
          :key="String(o.value)"
          :value="o.value"
        >
          {{ o.label }}
        </option>
      </select>
      </div>
      <div class="flex justify-between gap-2">
        <button
          type="button"
          @click="handleCancel"
          class="btn btn-secondary"
        >
          {{ $t('btn.cancel') }}
        </button>
        <button
          type="submit"
          class="btn btn-primary"
        >
          {{ $t(submitBtnName) }}
        </button>
      </div>
    </form>
  </div>
</template>