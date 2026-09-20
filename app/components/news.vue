<script setup lang="ts">
import {marked} from 'marked'

const news = [
  `
### Расписание и состояния загрузки

- добавлено подтверждение перед удалением сотрудников и смен;
- формы показывают единый индикатор загрузки и блокируют повторную отправку;
- массовое создание смен стало стабильнее;
- исправлено отображение смен и обновление календаря после изменений;
- улучшены сообщения об ошибках на русском и английском языках.

Техническая версия: \`f7f56da\`
`,
  `
### Новости появились на главной

На главную страницу добавлен раздел с описанием последних изменений в Markdown-формате.

Техническая версия: \`8d0fb03\`
`,
  `
### Новости и кнопки стали удобнее

- на главной можно пролистывать три последних обновления;
- при открытии сразу показывается самая свежая новость;
- кнопки сохранения, удаления и отмены получили понятные состояния и единое оформление.

Техническая версия: \`cf8ee7d\`
`,
]

const currentIndex = ref(news.length - 1)
const html = computed(() => marked.parse(news[currentIndex.value] ?? '', {async: false}))

function showPrevious() {
  currentIndex.value = (currentIndex.value - 1 + news.length) % news.length
}

function showNext() {
  currentIndex.value = (currentIndex.value + 1) % news.length
}
</script>

<template>
  <section class="w-full max-w-2xl border-t border-[var(--border-main)] pt-6">
    <div class="mb-5 flex items-center justify-between gap-4">
      <h2 class="text-2xl font-bold text-[var(--text-main)]">Что нового</h2>
      <span class="text-sm tabular-nums text-[var(--text-muted)]">
        {{ currentIndex + 1 }} / {{ news.length }}
      </span>
    </div>
    <article
      :key="currentIndex"
      class="min-h-52 text-left text-[var(--text-soft)] [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[var(--text-main)] [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_code]:rounded [&_code]:bg-[var(--bg-context)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:text-[var(--text-main)]"
      v-html="html"
    />
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
          v-for="(_, index) in news"
          :key="index"
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
