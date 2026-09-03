<script setup lang="ts">
import {useAuthStore} from "~/stores/auth";
import {isValidEmail, isValidName, isValidPassword} from '~~/shared/utils/validation'
import {useErrorModal} from '../composables/useErrorModal'
const auth = useAuthStore()
const errorModal = useErrorModal()
const fields = computed(() => [
  {key: 'name', type: 'text', placeholder: 'form.placeholder.name'},
  {key: 'email', type: 'email', placeholder: 'form.placeholder.email'},
  {key: 'password', type: 'password', placeholder: 'form.placeholder.password'},
  {key: 'confirmPassword', type: 'password', placeholder: 'form.placeholder.confirmPassword'},
] as const)

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  gender: '',
})

async function onRegister() {
  if (form.value.email === '' ||
    form.value.password === '' ||
    form.value.confirmPassword === '' ||
    form.value.name === ''
  ) {
    errorModal.showError('error.form.fieldsEmpty')
    return
  } else if (form.value.gender === '') {
    errorModal.showError('error.auth.selectGender')
    return
  }
  if (form.value.password !== form.value.confirmPassword) {
    errorModal.showError('error.auth.passwordsNotMatch')
    return
  } else if (!isValidPassword(form.value.password)) {
    errorModal.showInfo('error.auth.passwordLength')
    return
  } else if (!isValidName(form.value.name)) {
    errorModal.showError('error.auth.nameLength')
    return
  } else if (!isValidName(form.value.name)) {
    errorModal.showError('error.auth.nameLength')
    return
  }
  if (!isValidEmail(form.value.email)) {
    errorModal.showError('error.auth.emailInvalid')
    return
  }

  try {
    const {confirmPassword, ...payload} = form.value
    await auth.signUp(payload)

    await auth.login(form.value)

    await navigateTo('/dashboard')
  } catch (e: unknown) {
    const error = e as {statusCode?: number; status?: number; response?: {status?: number}}
    const status = error.statusCode || error.status || error.response?.status

    errorModal.showError(status === 409
    ? 'error.auth.emailExist'
    : 'error.auth.register'
    )
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
    :name="$t('auth.signUp')"
    :inputs="fields"
    :sex="true"
    :btn-name="$t('auth.signUp')"
    :disc="$t('auth.haveAccount')"
    :text-link="$t('auth.login')"
    link="/sign-in"
    v-model="form"
    @submit="onRegister"/>
  <ErrorModalContent
    :error="errorModal.error.value"
    @close="errorModal.close"
    class="w-[300px] h-[200px] top-1/4"
  />
</template>
