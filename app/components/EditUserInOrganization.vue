<script setup lang="ts">
import Modal from './Modal.vue'
import { useEmployeeStore } from '~/stores/employee.ts'
import { useUserStore } from '~/stores/user.ts'
import { useAuthStore } from '~/stores/auth.ts'
import { useOrganizationStore } from '~/stores/organization.ts'
import type { UserWithRole } from '~~/types/user.ts'
import type { Employee } from '~~/types/employee.ts'

const props = defineProps<{
  userId: string
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'close'): void
}>()

function onUpdateModelValue(value: boolean) {
  emit('update:modelValue', value)

  if (!value) {
    resetModal()
    emit('close')
  }
}

const employeeStore = useEmployeeStore()
const userStore = useUserStore()
const organizationStore = useOrganizationStore()
const auth = useAuthStore()
const me = storeToRefs(auth)
const errorModal = useErrorModal()

const isManager = computed(() => organizationStore.isManager)

const employee = ref<Employee>()
const user = ref<UserWithRole>()
const isLoading = ref(false)
const isSubmitting = ref(false)
const btnName = computed(() =>
  user.value?.id === me.user.value?.id
    ? $t('btn.you')
    : user.value?.role.name === 'owner'
      ? $t('btn.itsOwner')
      : user.value?.role.name === 'user'
        ? $t('btn.appointAnAdmin')
        : $t('btn.disAppointAnAdmin'),
)
async function switchRole() {
  if (!user.value) {
    return
  }
  isSubmitting.value = true
  try {
    if (user.value.role.name === 'user') {
      await userStore.appointAdmin(user.value.id)
    } else if (user.value.role.name === 'admin') {
      await userStore.disAppointAdmin(user.value.id)
    }
    await fetchUserData()
  } catch (e: unknown) {
    console.log(e)
    errorModal.showError($t('error.changeRole'))
  } finally {
    isSubmitting.value = false
  }
}

async function fetchUserData() {
  if (!props.userId) {
    return
  }
  isLoading.value = true
  try {
    user.value = await userStore.getUserWithRole(props.userId)
    employee.value = await employeeStore.getEmployeeById(props.userId)
  } catch (e: unknown) {
    console.log(e)
    errorModal.showError($t('error.data.notLoaded'))
  } finally {
    isLoading.value = false
  }
}

function resetModal() {
  user.value = undefined
  employee.value = undefined
  isLoading.value = false
  isSubmitting.value = false
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      void fetchUserData()
    }
  },
)
</script>

<template>
  <Modal :model-value="modelValue" @update:model-value="onUpdateModelValue">
    <div
      v-if="isLoading"
      class="flex min-h-[220px] w-full items-center justify-center p-6 sm:w-[420px]"
    >
      <Loading class="min-h-[180px] w-full" />
    </div>
    <div
      v-else
      class="flex max-h-[calc(100dvh-1rem)] w-full flex-col gap-5 overflow-y-auto p-5 pt-12 sm:w-[420px] sm:p-6 sm:pt-10"
    >
      <header class="flex items-center gap-3 border-b border-[var(--border-main)] pr-8 pb-4">
        <div
          class="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[var(--border-main)] bg-[var(--btn-bg)] text-lg font-bold text-[var(--text-blue)]"
          aria-hidden="true"
        >
          {{ user?.name?.slice(0, 1).toUpperCase() || '?' }}
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="truncate text-xl font-bold text-[var(--text-main)]">
            {{ user?.name || '—' }}
          </h3>
          <span
            class="mt-1 inline-flex rounded-full border border-[var(--border-main)] bg-[var(--btn-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--text-soft)] capitalize"
            :class="
              user?.role.name !== 'user' ? 'border-[var(--text-blue)] text-[var(--text-blue)]' : ''
            "
          >
            {{
              user?.role.name === 'owner'
                ? $t('ui.owner')
                : user?.role.name === 'admin'
                  ? $t('ui.admin')
                  : $t('ui.user')
            }}
          </span>
        </div>
      </header>

      <div class="grid gap-2">
        <div
          class="flex items-center justify-between gap-4 rounded-lg border border-[var(--border-main)] bg-[var(--input-bg)] px-3 py-2.5"
        >
          <span
            class="shrink-0 text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase"
            >{{ $t('auth.email') }}</span
          >
          <span class="min-w-0 truncate text-right text-sm text-[var(--text-main)]">
            {{ user?.email || '—' }}
          </span>
        </div>

        <div
          v-if="employee"
          class="flex items-center justify-between gap-4 rounded-lg border border-[var(--border-main)] bg-[var(--input-bg)] px-3 py-2.5"
        >
          <span
            class="shrink-0 text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase"
            >{{ $t('ui.employee') }}</span
          >
          <span class="min-w-0 truncate text-right text-sm text-[var(--text-soft)]">
            {{ [employee.name, employee.surname, employee.middlename].filter(Boolean).join(' ') }}
          </span>
        </div>

        <div
          v-else
          class="flex items-center justify-between gap-4 rounded-lg border border-[var(--border-main)] bg-[var(--input-bg)] px-3 py-2.5"
        >
          <span
            class="shrink-0 text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase"
            >{{ $t('ui.status') }}</span
          >
          <span class="text-sm text-[var(--text-muted)]">{{ $t('ui.notAnEmployee') }}</span>
        </div>
      </div>

      <button
        v-if="organizationStore.isOwner"
        class="min-h-11 rounded-lg border border-[var(--border-main)] bg-[var(--btn-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--btn-text)] transition hover:border-[var(--text-blue)] hover:text-[var(--text-blue)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        :disabled="
          isSubmitting ||
          !isManager ||
          user?.role.name === 'owner' ||
          user?.id === me.user.value?.id
        "
        @click="switchRole"
      >
        {{ btnName }}
      </button>
    </div>
  </Modal>
  <ErrorModalContent
    :error="errorModal.error.value"
    class="top-1/4 h-[200px] w-[300px]"
    @close="errorModal.close"
  />
</template>
