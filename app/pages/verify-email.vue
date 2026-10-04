<script setup lang="ts">
const route = useRoute()

const token = computed(() => {
  const value = route.query.token
  return typeof value === 'string' ? value : ''
})

const state = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const errorMessage = ref('')

async function verifyEmail() {
  if (!token.value) {
    state.value = 'error'
    errorMessage.value = 'Ссылка подтверждения некорректна.'
    return
  }

  state.value = 'loading'
  errorMessage.value = ''

  try {
    await $fetch('/api/auth/verify-email', {
      method: 'POST',
      body: { token: token.value },
    })

    state.value = 'success'
  } catch {
    state.value = 'error'
    errorMessage.value = 'Ссылка недействительна или уже использована.'
  }
}
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
    <section class="w-full rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
      <h1 class="mb-4 text-2xl font-semibold">Подтверждение почты</h1>

      <template v-if="state === 'idle'">
        <p class="mb-6 text-gray-600">
          Нажмите кнопку, чтобы подтвердить адрес электронной почты.
        </p>

        <button
          type="button"
          class="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
          @click="verifyEmail"
        >
          Подтвердить email
        </button>
      </template>

      <p v-else-if="state === 'loading'" class="text-gray-600">
        Проверяем ссылку…
      </p>

      <template v-else-if="state === 'success'">
        <p class="text-green-600">
          Email успешно подтверждён.
        </p>
      </template>

      <p v-else class="text-red-600">
        {{ errorMessage }}
      </p>
    </section>
  </main>
</template>