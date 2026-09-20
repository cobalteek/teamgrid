<script setup lang="ts">
import {marked} from 'marked'

const markdown = `
## Что нового

### Обновление от 20 сентября

В последней группе изменений улучшена работа с расписанием и состояниями загрузки:

- добавлено подтверждение перед удалением сотрудников и смен;
- формы показывают единый индикатор загрузки и блокируют повторную отправку;
- массовое создание смен стало стабильнее;
- исправлено отображение смен и обновление календаря после изменений;
- улучшены сообщения об ошибках на русском и английском языках.

Техническая версия: \`f7f56da\`
`

const html = marked.parse(markdown, {async: false})
</script>

<template>
  <section class="w-full max-w-2xl border-t border-[var(--border-main)] pt-6">
    <article
      class="text-left text-[var(--text-soft)] [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[var(--text-main)] [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[var(--text-main)] [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_code]:rounded [&_code]:bg-[var(--bg-context)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:text-[var(--text-main)]"
      v-html="html"
    />
  </section>
</template>
