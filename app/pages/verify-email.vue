<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()

const email = ref('')
const code = ref('')
const state = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const errorMessage = ref('')
const resendState = ref<'idle' | 'loading' | 'sent'>('idle')

onMounted(() => {
  const value = route.query.email
  if (typeof value === 'string') {
    email.value = value
  }
})

async function verifyEmail() {
  if (!email.value || !/^\d{6}$/.test(code.value)) {
    state.value = 'error'
    errorMessage.value = 'Введите email и 6-значный код.'
    return
  }

  state.value = 'loading'
  errorMessage.value = ''

  try {
    await $fetch('/api/auth/verify-email', {
      method: 'POST',
      body: { email: email.value, code: code.value },
    })

    state.value = 'success'
  } catch {
    state.value = 'error'
    errorMessage.value = 'Код недействителен, истёк или уже использован.'
  }
}

async function resendCode() {
  if (!email.value || !/^\S+@\S+\.\S+$/.test(email.value)) {
    state.value = 'error'
    errorMessage.value = 'Введите корректный email.'
    return
  }

  resendState.value = 'loading'

  try {
    await $fetch('/api/auth/resend-verification', {
      method: 'POST',
      body: { email: email.value },
    })
    resendState.value = 'sent'
  } catch {
    resendState.value = 'sent'
  }
}
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
    <section class="w-full rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
      <h1 class="mb-4 text-2xl font-semibold">Подтверждение почты</h1>

      <template v-if="state === 'idle' || state === 'error'">
        <p class="mb-6 text-gray-600">
          Введите код из письма, чтобы подтвердить адрес электронной почты.
        </p>

        <form class="flex flex-col gap-3" @submit.prevent="verifyEmail">
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="Email"
            class="rounded-lg border border-gray-300 px-3 py-3"
          />
          <input
            v-model="code"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="6"
            pattern="[0-9]{6}"
            placeholder="6-значный код"
            class="rounded-lg border border-gray-300 px-3 py-3 text-center tracking-[0.4em]"
          />
          <button
            type="submit"
            class="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
          >
            Подтвердить email
          </button>
        </form>

        <button
          type="button"
          class="mt-3 text-blue-600 underline disabled:cursor-wait disabled:opacity-60"
          :disabled="resendState === 'loading'"
          @click="resendCode"
        >
          {{
            resendState === 'loading'
              ? t('email.verification.resending')
              : t('email.verification.resend')
          }}
        </button>

        <p v-if="resendState === 'sent'" class="mt-2 text-sm text-gray-600">
          {{ t('email.verification.resendHint') }}
        </p>

        <p v-if="state === 'error'" class="mt-4 text-red-600">
          {{ errorMessage }}
        </p>
      </template>

      <p v-else-if="state === 'loading'" class="text-gray-600">Проверяем код…</p>

      <template v-else>
        <p class="text-green-600">Email успешно подтверждён.</p>
        <NuxtLink to="/login" class="mt-4 inline-block text-blue-600 underline">
          Перейти ко входу
        </NuxtLink>
      </template>
    </section>
  </main>
</template>
