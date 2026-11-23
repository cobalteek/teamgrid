<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { UserSettings } from '~~/types/user-settings'
import { useUserSettingsStore } from '~/stores/userSettings'

definePageMeta({
  middleware: ['auth'],
  layout: 'dashboard-admin',
})

const { t, setLocale } = useI18n()
const settingsStore = useUserSettingsStore()
const { settings, isLoading } = storeToRefs(settingsStore)
const activeTheme = useState<'dark' | 'light'>('theme', () => settings.value.theme)
const isSaved = ref(false)
const saveError = ref(false)

const draft = ref<UserSettings>({ ...settings.value })

watch(
  settings,
  (value) => {
    draft.value = { ...value }
  },
  { deep: true },
)

useHead({
  title: computed(() => `${t('settings.title')} — TeamGrid`),
})

function applyTheme(nextTheme: UserSettings['theme']) {
  activeTheme.value = nextTheme

  document.documentElement.classList.toggle('light', nextTheme === 'light')
  localStorage.setItem('theme', nextTheme)
}

async function saveSettings() {
  isSaved.value = false
  saveError.value = false

  try {
    const saved = await settingsStore.updateSettings(draft.value)
    await setLocale(saved.locale)
    applyTheme(saved.theme)
    isSaved.value = true
  } catch {
    saveError.value = true
  }
}
</script>

<template>
  <section class="mx-auto w-full max-w-3xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-[var(--text-main)]">{{ $t('settings.title') }}</h1>
      <p class="mt-1 text-sm text-[var(--text-muted)]">{{ $t('settings.subtitle') }}</p>
    </div>

    <form class="space-y-4" @submit.prevent="saveSettings">
      <div class="rounded-2xl border border-[var(--border-main)] bg-[var(--bg-context)] p-4 sm:p-6">
        <h2 class="text-lg font-bold text-[var(--text-main)]">{{ $t('settings.appearance') }}</h2>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <label class="flex flex-col gap-2 text-sm font-medium text-[var(--text-soft)]">
            Language
            <select
              v-model="draft.locale"
              class="min-h-11 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-[var(--input-text)]"
            >
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </label>
          <label class="flex flex-col gap-2 text-sm font-medium text-[var(--text-soft)]">
            {{ $t('settings.theme') }}
            <select
              v-model="draft.theme"
              class="min-h-11 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-[var(--input-text)]"
            >
              <option value="dark">{{ $t('settings.dark') }}</option>
              <option value="light">{{ $t('settings.light') }}</option>
            </select>
          </label>
        </div>
      </div>

      <div class="rounded-2xl border border-[var(--border-main)] bg-[var(--bg-context)] p-4 sm:p-6">
        <h2 class="text-lg font-bold text-[var(--text-main)]">{{ $t('settings.schedule') }}</h2>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <label class="flex flex-col gap-2 text-sm font-medium text-[var(--text-soft)]">
            {{ $t('settings.timeFormat') }}
            <select
              v-model="draft.timeFormat"
              class="min-h-11 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-[var(--input-text)]"
            >
              <option value="24h">{{ $t('settings.timeFormat24') }}</option>
              <option value="12h">{{ $t('settings.timeFormat12') }}</option>
            </select>
          </label>
          <label class="flex flex-col gap-2 text-sm font-medium text-[var(--text-soft)]">
            {{ $t('settings.dateFormat') }}
            <select
              v-model="draft.dateFormat"
              class="min-h-11 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-[var(--input-text)]"
            >
              <option value="dmy">{{ $t('settings.dateFormatDmy') }}</option>
              <option value="mdy">{{ $t('settings.dateFormatMdy') }}</option>
            </select>
          </label>
          <label class="flex flex-col gap-2 text-sm font-medium text-[var(--text-soft)]">
            {{ $t('settings.weekStartsOn') }}
            <select
              v-model="draft.weekStartsOn"
              class="min-h-11 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-[var(--input-text)]"
            >
              <option value="monday">{{ $t('settings.monday') }}</option>
              <option value="sunday">{{ $t('settings.sunday') }}</option>
            </select>
          </label>
          <label
            class="flex cursor-pointer items-start gap-3 text-sm font-medium text-[var(--text-soft)] sm:col-span-2"
          >
            <input
              v-model="draft.excludeRussianFiveTwoHolidays"
              type="checkbox"
              class="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
            />
            <span>
              <span class="block text-[var(--text-main)]">
                {{ $t('settings.excludeRussianFiveTwoHolidays') }}
              </span>
              <span class="mt-1 block text-xs font-normal text-[var(--text-muted)]">
                {{ $t('settings.excludeRussianFiveTwoHolidaysDescription') }}
              </span>
            </span>
          </label>
        </div>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <span v-if="isSaved" class="text-sm text-emerald-600 dark:text-emerald-400">
          {{ $t('settings.saved') }}
        </span>
        <span v-if="saveError" class="text-sm text-red-600 dark:text-red-400">
          {{ $t('settings.saveError') }}
        </span>
        <button
          type="submit"
          class="min-h-11 rounded-lg bg-[var(--btn-bg)] px-4 font-semibold text-[var(--btn-text)] transition hover:bg-[var(--bg-hover-context)] disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isLoading"
        >
          {{ $t('settings.save') }}
        </button>
      </div>
    </form>
  </section>
</template>
