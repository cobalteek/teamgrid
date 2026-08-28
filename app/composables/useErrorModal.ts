export function useErrorModal() {
  const error = ref({
    modelValue: false,
    text: '',
    type: <'error' | 'info'> 'error'
  })

  function showError(message: string) {
    error.value.type = 'error'
    error.value.text = message
    error.value.modelValue = true
  }

  function showInfo(message: string) {
    error.value.type = 'info'
    error.value.text = message
    error.value.modelValue = true
  }

  function close() {
    error.value.modelValue = false
    error.value.text = ''
  }

  return {
    error,
    showError,
    showInfo,
    close,
  }
}