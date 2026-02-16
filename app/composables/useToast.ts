const toastMessage = ref('')
const toastVisible = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null

export function useToast() {
  function showToast(msg: string) {
    toastMessage.value = msg
    toastVisible.value = true
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      toastVisible.value = false
      toastTimer = null
    }, 2500)
  }

  return {
    toastMessage: readonly(toastMessage),
    toastVisible: readonly(toastVisible),
    showToast,
  }
}
