type SendNotificationPayload = {
  title: string
  message: string
  all?: boolean
  allMissingConsent?: boolean
  userIds?: string[]
  emails?: string[]
  actionUrl?: string
  checkboxes?: {
    label: string
    required?: boolean
  }[]
  consentRequired?: boolean
  consentType?: string
  consentVersion?: string
}

type SendNotificationResult = {
  id: string
  title: string
  message: string
  actionUrl: string | null
  consentRequired: boolean
  consentType: string | null
  consentVersion: string | null
  isGlobal: boolean
  createdAt: string
  recipientCount: number | 'all'
}

declare global {
  interface Window {
    sendNotification: (payload: SendNotificationPayload) => Promise<SendNotificationResult>
  }
}

export default defineNuxtPlugin(() => {
  window.sendNotification = (payload) =>
    $fetch<SendNotificationResult>('/api/notifications', {
      method: 'POST',
      credentials: 'include',
      body: payload,
    })
})
