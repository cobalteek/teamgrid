<script setup lang="ts">
const theme = useState<'dark' | 'light'>('theme', () => 'dark')

const animationKey = ref(0)
const shouldAnimate = ref(false)

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'

  if (import.meta.client) {
    document.documentElement.classList.toggle('light', theme.value === 'light')
    localStorage.setItem('theme', theme.value)
  }
  shouldAnimate.value = true
  animationKey.value += 1
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null

  if (savedTheme) {
    theme.value = savedTheme
  }

  document.documentElement.classList.toggle('light', theme.value === 'light')
})
</script>

<template>
  <button
    type="button"
    class="group flex h-[3.25rem] w-[3.25rem] cursor-pointer items-center justify-center rounded-xl border border-[var(--border-main)] bg-[var(--btn-bg)] text-[var(--text-main)] transition hover:border-[var(--text-blue)] hover:bg-[var(--bg-hover-context)] hover:text-[var(--text-blue)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-blue)] active:scale-[0.98]"
    :aria-label="`Switch to ${theme === 'light' ? 'light' : 'dark'} theme`"
    @click="toggleTheme"
  >
    <span
      :key="`rotate-${animationKey}`"
      class="block"
      :class="{ 'theme-icon-pop': shouldAnimate }"
      aria-hidden="true"
    >
      <svg
        v-if="theme === 'dark'"
        class="h-5 w-5 shrink-0 text-[var(--text-main)]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path
          d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        />
      </svg>
      <svg
        v-else
        class="h-5 w-5 shrink-0 text-[var(--text-main)]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </span>
  </button>
</template>

<style scoped>
.theme-icon-pop {
  animation: theme-icon-pop 360ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes theme-icon-pop {
  0% {
    transform: scale(0.65) rotate(-35deg);
    opacity: 0;
  }

  65% {
    transform: scale(1.12) rotate(8deg);
    opacity: 1;
  }

  100% {
    transform: scale(1) rotate(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .theme-icon-pop {
    animation: none;
  }
}
</style>
