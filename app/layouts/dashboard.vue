<script setup lang="ts">

</script>

<template>

  <div class="min-h-screen bg-[var(--bg-back)] text-[var(--text-main)]">
  <Header/>
    <main class="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl p-6">
        <slot/>
    </main>
  </div>
</template>