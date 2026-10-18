<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
const authStore = useAuthStore()
const email = ref('')
const isSubmitting = ref(false)
const errorModal = useErrorModal()

async function handleSubmit() {
  isSubmitting.value = true
  try {
    await authStore.recoverPassword(email.value)
    errorModal.showInfo('info.sendRecoverPassword')
  } catch (error) {
    console.log(error as string)
    errorModal.showError('error.recoverPassword')
    throw error
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex flex-col items-center justify-center min-h-screen py-2">
      <div class="w-full max-w-md p-8 space-y-3 rounded-xl bg-[var(--bg-modal)] text-[var(--text-main)]">
        <h1 class="text-2xl font-bold text-center">{{ $t('ui.recoverPassword') }}</h1>
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <div class="space-y-1 text-sm">
            <label for="email" class="block text-gray-600 dark:text-gray-400">{{ $t('placeholder.email') }}</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="email@example.com"
              v-model="email"
              required
              class="w-full px-4 py-3 rounded-md bg-[var(--input-bg)] focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full px-4 py-3 font-semibold bg-[var(--btn-bg)] rounded-md hover:bg-[var(--btn-hover)] focus:outline-none focus:ring focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Submitting...' : $t('ui.sendMessage') }}
          </button>
        </form>
      </div>
      <ErrorModalContent
        :error="errorModal.error.value"
        class="top-1/4 h-[200px] w-[300px]"
        @close="errorModal.close"
      />
    </div>
  </div>
</template>