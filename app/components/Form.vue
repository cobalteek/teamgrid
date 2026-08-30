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

type SelectKey<T> = {
  [K in keyof T]: T[K] extends string | number ? K : never
}[keyof T]

type Select<T> = {
  [K in SelectKey<T>]: {
    key: K
    placeholder: string
    disabledOption: string
    selectOption: {
      label: string
      value: T[K]
    }[]
  }
}[SelectKey<T>]

type StringKey<T> = {
  [K in keyof T]: T[K] extends string ? K : never
}[keyof T]

type Field<T> = {
  [K in StringKey<T>]: {
    key: K
    type: string
    placeholder: string
  }
}[StringKey<T>]

function updateField(
  key: StringKey<T>,
  value: string
) {
  ;(props.modelValue as Record<StringKey<T>, string>)[key] = value
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
    props.modelValue[select.key] = option.value
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
        :value="modelValue[field.key] ?? ''"
        @input="updateField(
          field.key,
          ($event.target as HTMLInputElement).value
        )"
        :type="field.type"
        :placeholder="$t(field.placeholder)"
        class="pl-2"
        />
      <div
        v-if="selects"
        class="flex flex-col gap-4 w-full"
      >
        <select
        v-for="select in selects"
        :key="select.key"
        :value="modelValue[select.key] ?? ''"
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