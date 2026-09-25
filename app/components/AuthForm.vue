<script setup lang="ts">
const props = defineProps<{
  name: string
  inputs: readonly Field[]
  modelValue: Model
  btnName: string
  disc: string
  link: string
  textLink: string
  sex?: boolean
  isLoading?: boolean
}>()

type Field = { key: string; type: string; placeholder: string }
type Model = Record<string, string>

const emit = defineEmits<{
  (e: 'update:modelValue', v: Model): void
  (e: 'submit'): void
  (e: 'close'): void
}>()

const handleSubmit = () => {
  emit('submit')
}

function setValue(key: string, value: string) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <div class="w-full max-w-[380px] rounded-xl bg-[var(--bg-modal)] p-5 sm:p-10">
    <Loading v-if="isLoading" class="min-h-[260px] w-full" />
    <div v-else class="mx-auto flex flex-col items-center justify-between">
      <h4 class="mb-2 text-xl font-bold">
        {{ name }}
      </h4>
      <form
        @submit.prevent="handleSubmit"
        class="mx-auto flex flex-col items-center justify-between"
      >
        <input
          v-for="field in inputs"
          :key="field.key"
          :value="modelValue[field.key] ?? ''"
          @input="setValue(field.key, ($event.target as HTMLInputElement).value)"
          :type="field.type"
          :placeholder="$t(field.placeholder)"
          class="mb-4 min-h-11 rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] p-2 pl-3 text-[var(--input-text)] sm:mb-5"
        />
        <div v-if="sex" class="flex gap-6">
          <label class="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="gender"
              value="male"
              class="h-3 w-3 rounded-full border-2 border-gray-500 transition peer-checked:border-gray-300 peer-checked:bg-gray-600"
              :checked="modelValue.gender === 'male'"
              @change="setValue('gender', 'male')"
            />
            <span>{{ $t('user.male') }}</span>
          </label>
          <label class="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="gender"
              value="female"
              class="h-3 w-3 rounded-full border-2 border-gray-500 transition peer-checked:border-gray-300 peer-checked:bg-gray-600"
              :checked="modelValue.gender === 'female'"
              @change="setValue('gender', 'female')"
            />
            <span>{{ $t('user.female') }}</span>
          </label>
        </div>
        <button
          type="submit"
          class="text-bold mt-3 w-1/2 rounded-xl bg-[var(--btn-bg)] p-1 transition duration-300 hover:bg-[var(--btn-hover-bg)]"
        >
          {{ btnName }}
        </button>
      </form>
      <div class="flex w-full flex-col items-center justify-between pt-3">
        <div>
          {{ disc }}
        </div>
        <NuxtLink
          v-if="textLink"
          :to="link"
          class="text-[var(--text-blue)] transition duration-300 hover:bg-gray-600"
        >
          {{ textLink }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
