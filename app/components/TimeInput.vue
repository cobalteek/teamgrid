<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    placeholder: '',
    disabled: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const { settings, canonicalTimeToDisplay, minutesToCanonicalTime, parseTimeInput } =
  useUserDisplayPreferences()
const displayValue = ref('')

const example = computed(() => (settings.value.timeFormat === '12h' ? '6:30 PM' : '18:30'))

function syncDisplayValue() {
  displayValue.value = canonicalTimeToDisplay(props.modelValue)
}

function handleInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  displayValue.value = value

  const minutes = parseTimeInput(value)
  if (minutes !== null) emit('update:modelValue', minutesToCanonicalTime(minutes))
}

function handleBlur() {
  const minutes = parseTimeInput(displayValue.value)
  if (minutes !== null) {
    const canonical = minutesToCanonicalTime(minutes)
    emit('update:modelValue', canonical)
    displayValue.value = canonicalTimeToDisplay(canonical)
  } else {
    syncDisplayValue()
  }
}

watch([() => props.modelValue, () => settings.value.timeFormat], syncDisplayValue, {
  immediate: true,
})
</script>

<template>
  <input
    :value="displayValue"
    type="text"
    inputmode="numeric"
    autocomplete="off"
    :placeholder="displayValue ? '' : example"
    :aria-label="placeholder"
    :disabled="disabled"
    class="min-h-11 min-w-0 rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] p-2 text-[var(--input-text)] disabled:cursor-not-allowed disabled:opacity-50"
    @input="handleInput"
    @blur="handleBlur"
  />
</template>
