<script setup lang="ts">
import {useAuthStore} from "~/stores/auth";

const auth = useAuthStore()
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

const modalRef = ref(false);
const textError = ref('')

const type_ = ref('error')

async function onRegister() {
  if (form.value.email === '' ||
    form.value.password === '' ||
    form.value.confirmPassword === '' ||
    form.value.name === ''
  ) {
    textError.value = $t('error.form.fieldsEmpty')
    modalRef.value = true
    type_.value = 'error'
    return
  } else if (form.value.gender === '') {
    textError.value = $t('error.auth.selectGender')
    modalRef.value = true
    type_.value = 'error'
    return
  }
  if (form.value.password !== form.value.confirmPassword) {
    textError.value = $t('error.auth.passwordsNotMatch')
    modalRef.value = true
    type_.value = 'error'
    return
  } else if (form.value.password.length < 8) {
    textError.value = $t('error.auth.passwordLength')
    modalRef.value = true
    type_.value = 'info'
    return
  } else if (form.value.name.length < 3) {
    textError.value = $t('error.auth.nameLength')
    modalRef.value = true
    type_.value = 'error'
    return
  }

  try {
    const {confirmPassword, ...payload} = form.value
    await auth.signUp(payload)

    await auth.signIn(form.value)

    await navigateTo('/dashboard')
  } catch (e: unknown) {
    const error = e as {statusCode?: number; status?: number; response?: {status?: number}}
    const status = error.statusCode || error.status || error.response?.status

    type_.value = 'error'
    textError.value = status === 409 ? $t('error.auth.emailExist') : $t('error.auth.register')
    modalRef.value = true
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
    :text-link="$t('auth.signIn')"
    link="/sign-in"
    v-model="form"
    @submit="onRegister"/>
  <ErrorModalContent v-model="modalRef" class="w-[300px] h-[200px] top-[19%]" :type="type_" :text="textError"/>
</template>
