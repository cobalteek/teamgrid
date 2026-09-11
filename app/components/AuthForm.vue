<script setup lang="ts">
const props = defineProps<{
  name: string,
  inputs: readonly Field[];
  modelValue: Model;
  btnName: string;
  disc: string;
  link: string;
  textLink: string;
  sex?: boolean;
}>();

type Field = { key: string; type: string; placeholder: string }
type Model = Record<string, string>

const emit = defineEmits<{
  (e: 'update:modelValue', v: Model): void
  (e: 'submit'): void
}>()

function setValue(key: string, value: string) {
  emit('update:modelValue', {...props.modelValue, [key]: value})
}

</script>

<template>
  <div
    class="w-full max-w-[380px] rounded-xl bg-[var(--bg-modal)] p-5 sm:p-10">
    <div class="flex mx-auto flex-col justify-between items-center">
      <h4 class="font-bold text-xl mb-2 ">
        {{ name }}
      </h4>
      <form
        @submit.prevent="emit('submit')"
        class="flex mx-auto flex-col justify-between items-center">
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
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="male"
              class="w-3 h-3 rounded-full border-2 border-gray-500
            peer-checked:border-gray-300
            peer-checked:bg-gray-600
            transition"
              :checked="modelValue.gender === 'male'"
              @change="setValue('gender', 'male')"
            />
            <span>{{ $t('user.male') }}</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="female"
              class="w-3 h-3 rounded-full border-2 border-gray-500
             peer-checked:border-gray-300
            peer-checked:bg-gray-600
            transition"
              :checked="modelValue.gender === 'female'"
              @change="setValue('gender', 'female')"
            />
            <span>{{ $t('user.female') }}</span>
          </label>
        </div>
        <button
          type="submit"
          class="w-1/2 text-bold bg-[var(--btn-bg)] mt-3 rounded-xl p-1 hover:bg-[var(--btn-hover-bg)] transition duration-300"
        >
          {{ btnName }}
        </button>
      </form>
      <div class="flex flex-col justify-between items-center pt-3 w-full">
        <div>
          {{ disc }}
        </div>
        <NuxtLink
          v-if="textLink"
          :to="link"
          class="text-[var(--text-blue)] hover:bg-gray-600 transition duration-300"
        >
          {{ textLink }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
