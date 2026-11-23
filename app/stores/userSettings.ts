import { defineStore } from 'pinia'
import type { UpdateUserSettings, UserSettings } from '~~/types/user-settings'
import { defaultUserSettings } from '~~/types/user-settings'

export const useUserSettingsStore = defineStore('userSettings', () => {
  const requestFetch = useRequestFetch()
  const settings = ref<UserSettings>({ ...defaultUserSettings })
  const isLoading = ref(false)
  const isReady = ref(false)
  const error = ref<string | null>(null)

  async function getSettings() {
    isLoading.value = true
    error.value = null

    try {
      settings.value = await requestFetch<UserSettings>('/api/user/settings', {
        credentials: 'include',
        method: 'GET',
      })
      isReady.value = true
      return settings.value
    } catch (requestError: unknown) {
      error.value = String(requestError)
      throw requestError
    } finally {
      isLoading.value = false
    }
  }

  async function updateSettings(update: UpdateUserSettings) {
    isLoading.value = true
    error.value = null

    try {
      const nextSettings = await $fetch<UserSettings>('/api/user/settings', {
        credentials: 'include',
        method: 'PATCH',
        body: update,
      })
      settings.value = nextSettings
      isReady.value = true
      return nextSettings
    } catch (requestError: unknown) {
      error.value = String(requestError)
      throw requestError
    } finally {
      isLoading.value = false
    }
  }

  return {
    settings,
    isLoading,
    isReady,
    error,
    getSettings,
    updateSettings,
  }
})
