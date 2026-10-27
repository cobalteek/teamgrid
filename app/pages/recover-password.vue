<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

const email = ref('')
const isSubmitting = ref(false)

const errorModal = useErrorModal()
const isOpenCodeInput = ref(false)
const code = ref('')

useHead({
  title: $t('pages.recoverPassword'),
})

async function handleSubmit() {
  isSubmitting.value = true
  try {
    if (!isOpenCodeInput.value) {
      await authStore.recoverPassword(email.value)
      isOpenCodeInput.value = true
      return
    }
    await authStore.verifyRecoverCode(email.value, code.value)
  } catch (error) {
    console.log(error as string)
    errorModal.showError('error.recoverPassword')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex min-h-screen flex-col items-center justify-center py-2">
      <div
        class="w-full max-w-md space-y-3 rounded-xl bg-[var(--bg-modal)] p-8 text-[var(--text-main)]"
      >
        <h1 class="text-center text-2xl font-bold">{{ $t('ui.recoverPassword') }}</h1>
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <div class="flex flex-col items-center justify-center space-y-1 text-sm">
            <input
              id="email"
              v-model="email"
              type="email"
              name="email"
              placeholder="email@example.com"
              required
              class="min-h-11 w-[100%] rounded border border-[var(--input-border)] bg-[var(--input-bg)] pl-3 text-[var(--input-text)]"
            />
            <div v-if="isOpenCodeInput">
              <label class="my-1 block text-gray-600 dark:text-gray-400">{{
                $t('ui.sendCode')
              }}</label>
              <input
                v-model="code"
                type="text"
                inputmode="numeric"
                autocomplete="one-time-code"
                maxlength="6"
                pattern="[0-9]{6}"
                :placeholder="$t('placeholder.code')"
                class="min-h-11 w-[100%] rounded border border-[var(--input-border)] bg-[var(--input-bg)] text-center tracking-[0.4em] text-[var(--input-text)]"
              />
            </div>
          </div>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="focus:ring-opacity-50 w-full rounded-md bg-[var(--btn-bg)] px-4 py-3 font-semibold hover:bg-[var(--btn-hover)] focus:ring focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ isOpenCodeInput ? $t('btn.verifyCode') : $t('btn.sendCode') }}
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
