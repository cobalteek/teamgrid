export function useErrorModal() {
  const isOpen = ref(false)
  const text = ref('')
  const type = ref<'error' | 'info'>('error')

  function showError(message: string) {
    type.value = 'error'
    text.value = message
    isOpen.value = true
  }

  function showInfo(message: string) {
    type.value = 'info'
    text.value = message
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    text.value = ''
  }

  return {
    isOpen,
    text,
    type,
    showError,
    showInfo,
    close,
  }
}