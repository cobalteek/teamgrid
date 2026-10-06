<script setup lang="ts">
import Modal from './Modal.vue'

type NotificationCheckbox = {
  id: string
  label: string
  required: boolean
  sortOrder: number
  checked: boolean
}

type NotificationItem = {
  id: string
  title: string
  message: string
  actionUrl: string | null
  consentRequired: boolean
  consentType: string | null
  consentVersion: string | null
  createdAt: string
  checkboxes: NotificationCheckbox[]
}

const notification = ref<NotificationItem | null>(null)
const isLoading = ref(false)
let pollTimer: ReturnType<typeof setInterval> | undefined

const canAccept = computed(() => {
  if (!notification.value?.consentRequired) return false

  return notification.value.checkboxes
    .filter((checkbox) => checkbox.required)
    .every((checkbox) => checkbox.checked)
})

async function loadNotification() {
  if (isLoading.value || notification.value) return

  isLoading.value = true

  try {
    const notifications = await $fetch<NotificationItem[]>('/api/notifications', {
      credentials: 'include',
      query: { unread: 'true' },
    })

    notification.value = notifications[0] ?? null
  } catch {
    // Anonymous and unverified pages do not need to show a notification error.
  } finally {
    isLoading.value = false
  }
}

async function closeNotification() {
  const currentNotification = notification.value
  notification.value = null

  if (!currentNotification || currentNotification.consentRequired) return

  try {
    await $fetch(`/api/notifications/${currentNotification.id}/read`, {
      method: 'POST',
      credentials: 'include',
    })
  } catch {
    // A failed read request leaves the notification available on the next poll.
  }
}

async function openAction() {
  const currentNotification = notification.value
  if (!currentNotification?.actionUrl) return

  if (currentNotification.consentRequired) {
    notification.value = null
    await navigateTo(currentNotification.actionUrl)
    return
  }

  await closeNotification()
  await navigateTo(currentNotification.actionUrl)
}

async function acceptNotification() {
  const currentNotification = notification.value
  if (!currentNotification?.consentRequired || !canAccept.value) return

  try {
    await $fetch(`/api/notifications/${currentNotification.id}/accept`, {
      method: 'POST',
      credentials: 'include',
      body: {
        checkboxIds: currentNotification.checkboxes
          .filter((checkbox) => checkbox.checked)
          .map((checkbox) => checkbox.id),
      },
    })

    notification.value = null

    if (currentNotification.actionUrl) {
      await navigateTo(currentNotification.actionUrl)
    }
  } catch {
    // Keep the dialog open so the user can retry without losing the consent request.
  }
}

onMounted(async () => {
  await loadNotification()
  pollTimer = setInterval(loadNotification, 60_000)
})

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <Modal :model-value="Boolean(notification)" @update:model-value="closeNotification">
    <div v-if="notification" class="flex max-w-lg flex-col gap-4 p-6 pr-14">
      <div>
        <p class="text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase">
          Уведомление
        </p>
        <h3 class="mt-1 text-xl font-semibold text-[var(--text-main)]">{{ notification.title }}</h3>
      </div>

      <p class="text-sm leading-6 whitespace-pre-line text-[var(--text-main)]">
        {{ notification.message }}
      </p>

      <form
        v-if="notification.checkboxes.length > 0"
        class="flex flex-col gap-3"
        @submit.prevent="acceptNotification"
      >
        <label
          v-for="checkbox in notification.checkboxes"
          :key="checkbox.id"
          :for="`notification-checkbox-${checkbox.id}`"
          class="flex cursor-pointer items-start gap-2 text-sm text-[var(--text-main)]"
        >
          <input
            :id="`notification-checkbox-${checkbox.id}`"
            v-model="checkbox.checked"
            type="checkbox"
            :required="checkbox.required"
            class="form-checkbox mt-0.5 h-4 w-4 shrink-0 text-[var(--btn-text)]"
          />
          <span>{{ checkbox.label }}</span>
        </label>

        <button
          v-if="notification.consentRequired"
          type="submit"
          :disabled="!canAccept"
          class="self-start rounded-lg bg-[var(--btn-bg)] px-4 py-2 text-sm font-semibold text-[var(--btn-text)] transition hover:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ $t('btn.accept') }}
        </button>
      </form>

      <button
        v-if="notification.actionUrl"
        type="button"
        class="self-start rounded-lg bg-[var(--btn-bg)] px-4 py-2 text-sm font-semibold text-[var(--btn-text)] transition hover:scale-[0.98]"
        @click="openAction"
      >
        Открыть документ
      </button>
    </div>
  </Modal>
</template>
