<script setup lang="ts">
import '../components/TeamGrid.vue'
const auth = useAuthStore()

definePageMeta({
  middleware: ['auth'],
  layout: 'dashboard'
})

const toggleView = 'dayGridMonth'

</script>

<template>
  <div class="w-full">
    <Toolbar/>
    <TeamGrid :settings="{ initialView: toggleView }"/>
  </div>
</template>
