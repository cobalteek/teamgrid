<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
  }>(),
  {
    placeholder: '',
    required: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const { settings, formatDateInput, parseDateInput } = useUserDisplayPreferences()
const displayValue = ref('')
const calendarInput = ref<HTMLInputElement | null>(null)

const example = computed(() => (settings.value.dateFormat === 'mdy' ? '12/31/2026' : '31.12.2026'))

function syncDisplayValue() {
  displayValue.value = formatDateInput(props.modelValue)
}

function handleInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  displayValue.value = value

  const parsed = parseDateInput(value)
  if (parsed) emit('update:modelValue', parsed)
}

function handleBlur() {
  const parsed = parseDateInput(displayValue.value)
  if (parsed) {
    emit('update:modelValue', parsed)
    displayValue.value = formatDateInput(parsed)
  } else {
    syncDisplayValue()
  }
}

function handleCalendarChange(event: Event) {
  const value = (event.target as HTMLInputElement).value
  const parsed = parseDateInput(value)
  if (!parsed) return

  emit('update:modelValue', parsed)
  displayValue.value = formatDateInput(parsed)
}

function openCalendar() {
  if (props.disabled || !calendarInput.value) return

  const picker = calendarInput.value as HTMLInputElement & { showPicker?: () => void }
  if (typeof picker.showPicker === 'function') {
    picker.showPicker()
  } else {
    picker.click()
  }
}

watch([() => props.modelValue, () => settings.value.dateFormat], syncDisplayValue, {
  immediate: true,
})
</script>

<template>
  <div class="relative flex min-w-0 gap-2">
    <input
      :value="displayValue"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      :placeholder="displayValue ? '' : example"
      :aria-label="placeholder"
      :required="required"
      :disabled="disabled"
      class="min-h-11 min-w-0 flex-1 rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] p-2 pl-3 text-[var(--input-text)] disabled:cursor-not-allowed disabled:opacity-50"
      @input="handleInput"
      @blur="handleBlur"
    />
    <button
      type="button"
      :aria-label="$t('ui.openCalendar')"
      :disabled="disabled"
      class="flex min-h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[var(--input-border)] bg-[var(--btn-bg)] text-[var(--btn-text)] transition hover:bg-[var(--bg-hover-context)] disabled:cursor-not-allowed disabled:opacity-50"
      @click="openCalendar"
    >
      <svg aria-hidden="true" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="4.5" width="18" height="16" rx="2" stroke-width="1.8" />
        <path d="M8 3v3M16 3v3M3 9h18" stroke-width="1.8" stroke-linecap="round" />
        <path
          d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01"
          stroke-width="2.4"
          stroke-linecap="round"
        />
      </svg>
    </button>
    <input
      ref="calendarInput"
      :value="props.modelValue"
      type="date"
      tabindex="-1"
      aria-hidden="true"
      class="pointer-events-none absolute h-px w-px opacity-0"
      @change="handleCalendarChange"
    />
  </div>
</template>
