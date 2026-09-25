<script setup lang="ts">
import newsData from '~/data/news.json'

type NewsBranch = 'master' | 'develop'

type NewsItem = {
  id: string
  branch: NewsBranch
  title: string
  summary: string
  items: string[]
  version: string
}

const news = newsData as NewsItem[]
const currentIndex = ref(0)

const activeBranch: NewsBranch =
  process.env.NODE_ENV === 'production' ? 'master' : 'develop'

const visibleNews = computed(() =>
  news.filter((item) => item.branch === activeBranch),
)

const currentNews = computed(() => visibleNews.value[currentIndex.value])

function showPrevious() {
  const length = visibleNews.value.length
  if (!length) return

  currentIndex.value = (currentIndex.value - 1 + length) % length
}

function showNext() {
  const length = visibleNews.value.length
  if (!length) return

  currentIndex.value = (currentIndex.value + 1) % length
}
</script>

<template>
  <section class="w-full max-w-2xl border-t border-[var(--border-main)] pt-6">
    <div class="mb-5 flex items-center justify-start">
      <h2 class="text-2xl font-bold text-[var(--text-main)]">Что нового</h2>
    </div>
    <article v-if="currentNews" :key="currentNews.id" class="min-h-52 text-left">
      <h3 class="mb-3 text-lg font-semibold text-[var(--text-main)]">
        {{ currentNews.title }}
      </h3>
      <p class="mb-4 text-[var(--text-soft)]">{{ currentNews.summary }}</p>
      <ul
        v-if="currentNews.items.length"
        class="mb-4 list-disc space-y-2 pl-5 text-[var(--text-soft)]"
      >
        <li v-for="item in currentNews.items" :key="item">{{ item }}</li>
      </ul>
      <p v-if="currentNews.version" class="text-sm text-[var(--text-muted)]">
        {{ currentNews.version }}
      </p>
    </article>
    <nav class="flex items-center justify-between" aria-label="Переключение новостей">
      <button
        type="button"
        class="btn flex size-10 items-center justify-center text-xl"
        aria-label="Предыдущая новость"
        title="Предыдущая новость"
        @click="showPrevious"
      >
        ←
      </button>
      <div class="flex items-center gap-2">
        <button
          v-for="(item, index) in visibleNews"
          :key="item.id"
          type="button"
          class="size-2 rounded-full transition-colors"
          :class="index === currentIndex ? 'bg-[var(--text-main)]' : 'bg-[var(--text-muted)]'"
          :aria-label="`Показать новость ${index + 1}`"
          :aria-current="index === currentIndex ? 'true' : undefined"
          @click="currentIndex = index"
        />
      </div>
      <button
        type="button"
        class="btn flex size-10 items-center justify-center text-xl"
        aria-label="Следующая новость"
        title="Следующая новость"
        @click="showNext"
      >
        →
      </button>
    </nav>
  </section>
</template>
