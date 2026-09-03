<script setup lang="ts">
import {useAuthStore} from "~/stores/auth";
import {useErrorModal} from '../composables/useErrorModal'

const auth = useAuthStore()
const fields = [
  {key: 'email', type: 'email', placeholder: 'form.placeholder.email'},
  {key: 'password', type: 'password', placeholder: 'form.placeholder.password'},
] as const

const form = ref({
  email: '',
  password: '',
})

const errorModal = useErrorModal()

async function onLogin() {

  if (form.value.email === '' || form.value.password === '') {
    errorModal.showError('error.form.fieldsEmpty')
    return
  } else if (form.value.password.length < 8) {
    errorModal.showInfo('error.auth.passwordLength')
    return
  }

  try {
    await auth.login(form.value)

    await navigateTo('/dashboard')
  } catch (e: unknown) {
    const error = e as {statusCode?: number; status?: number; response?: {status?: number}}
    const status = error.statusCode || error.status || error.response?.status
    if (status === 401) {
      errorModal.showError('error.auth.loginOrPasswordInvalid')
    }
  }
}

definePageMeta({
  middleware: [
    'guest',
  ],
})
</script>

<template>
  <AuthForm
    :name="$t('auth.login')"
    :inputs="fields"
    :btn-name="$t('auth.login')"
    :disc="$t('auth.noAccount')"
    :text-link="$t('auth.signUp')"
    link="/sign-up"
    v-model="form"
    @submit="onLogin"
  />
  <ErrorModalContent
    :error="errorModal.error.value"
    @close="errorModal.close"
    class="w-[300px] h-[200px] top-1/4"
  />
</template>
