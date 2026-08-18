<script setup lang="ts" generics="Model, Field, Select">
const props = defineProps<{
  title: string,
  fields?: readonly Field[];
  selects?: readonly Select[];
  modelValue: Model;
  date?: Date
  submitBtnName: string;
}>()


type SelectOption = { label: string, value: string | number }
type Select = { key: string, placeholder: string, selectOption: SelectOption[]}
type Field = { key: string; type: string; placeholder: string }
type Model = Record<string, string | number | Date>

const emit = defineEmits<{
  close: [],
  submit: []
}>()

function onSelectChange(
  event: Event,
  select: Select
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

const formatedDate = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'short'
}).format(props.date)
</script>

<template>
  <div class="flex flex-col justify-center items-center gap-4 p-4">
    <h2 class="text-xl font-bold p-2 pt-6">{{ $t(title) + " " + formatedDate}}</h2>
    <form @submit.prevent="handleSubmit" class="flex flex-col gap-4 w-full">
      <input
        v-if="fields"
        v-for="field in fields"
        :key="field.key"
        :value="modelValue[field.key] ?? ''"
        @input="modelValue[field.key] = ($event.target as HTMLInputElement).value"
        :type="field.type"
        :placeholder="$t(field.placeholder)"
        />
      <template
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
          v-for="(o) in select.selectOption"
          :key="o.value"
          :value="o.value"
        >
          {{ o.label }}
        </option>
      </select>
      </template>
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