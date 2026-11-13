<script setup lang="ts">
import { useErrorModal } from '~/composables/useErrorModal'
import { useAuthStore } from '~/stores/auth'

const errorModal = useErrorModal()
const authStore = useAuthStore()

const form = ref({
  password: '',
  confirmPassword: '',
})

async function handleSubmit() {
  if (!form.value.password || !form.value.confirmPassword) {
    errorModal.showError($t('error.form.fieldsEmpty'))
    return
  }
  if (form.value.password !== form.value.confirmPassword) {
    errorModal.showError($t('error.auth.passwordsNotMatch'))
    return
  }
  if (!isValidPassword(form.value.password)) {
    errorModal.showError($t('error.auth.passwordLength'))
    return
  }
  try {
    await authStore.updatePassword(form.value.password, form.value.confirmPassword)
  } catch (error) {
    console.log(error as string)
    errorModal.showError('error.recoverPassword')
  }
}

definePageMeta({
  middleware: ['password-reset'],
})

useHead({
  title: $t('pages.newPassword'),
})
</script>

<template>
  <div class="w-full max-w-[380px] rounded-xl bg-[var(--bg-modal)] p-5 sm:p-10">
    <div class="mx-auto flex flex-col items-center justify-between">
      <h4 class="mb-5 text-xl font-bold">
        {{ $t('ui.newPassword') }}
      </h4>
      <form
        class="mx-auto flex w-full flex-col items-center justify-between"
        @submit.prevent="handleSubmit"
      >
        <label class="sr-only" for="password">{{ $t('auth.password') }}</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          name="password"
          autocomplete="new-password"
          :placeholder="$t('auth.password')"
          required
          class="mb-4 min-h-11 w-full rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] p-2 pl-3 text-[var(--input-text)] transition outline-none focus:border-[var(--text-blue)] focus:ring-2 focus:ring-[var(--text-blue)]/20 sm:mb-5"
        />
        <label class="sr-only" for="confirmPassword">
          {{ $t('form.placeholder.confirmPassword') }}
        </label>
        <input
          id="confirmPassword"
          v-model="form.confirmPassword"
          type="password"
          name="confirmPassword"
          autocomplete="new-password"
          :placeholder="$t('form.placeholder.confirmPassword')"
          required
          class="mb-4 min-h-11 w-full rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] p-2 pl-3 text-[var(--input-text)] transition outline-none focus:border-[var(--text-blue)] focus:ring-2 focus:ring-[var(--text-blue)]/20 sm:mb-5"
        />
        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="mt-2 min-h-11 w-full rounded-xl bg-[var(--btn-bg)] px-4 py-2 font-semibold text-[var(--btn-text)] transition duration-300 hover:bg-[var(--btn-hover-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-blue)]"
        >
          {{ $t('btn.save') }}
        </button>
      </form>
    </div>
  </div>
  <ErrorModalContent
    :error="errorModal.error.value"
    class="top-1/4 h-[200px] w-[300px]"
    @close="errorModal.close"
  />
</template>
