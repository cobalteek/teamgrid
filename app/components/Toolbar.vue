<script setup lang="ts">
const isAddEmployeeModalOpen = ref(false)
</script>

<template>
  <div class="flex justify-end flex-row gap-2 w-full mb-3">
    <button @click="isAddEmployeeModalOpen = true" class="btn">
        {{$t('btn.addEmployee')}}
    </button>
    <button class="btn">
      {{ $t('btn.changePostEmployee') }}
    </button>
    <button class="btn">
      {{ $t('btn.edit') }}
    </button>
    <Modal v-model="isAddEmployeeModalOpen">
      <EntityModalAddEmployee
        @close="isAddEmployeeModalOpen = false"
      />
    </Modal>
  </div>
</template>