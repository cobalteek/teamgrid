<script setup lang="ts">
import { useCandidateStore } from '@/stores/candidate'
import type { Candidate } from '~~/types/candidate'
const candidateStore = useCandidateStore()
const candidate = ref<Candidate>({
  id: 0,
  name: '',
  surname: '',
  middlename: '',
  position: '',
  email: ''
})
const emit = defineEmits<{
  close: []
}>()

const handleCancel = () => {
  emit('close')
}

const handleSubmit = async () => {
  await candidateStore.createCandidate(candidate.value as Candidate)
  emit('close')
}

</script>

<template>
  <div class="flex flex-col justify-center items-center gap-4 p-4">
    <h2 class="text-xl font-bold p-2 pt-6">{{ $t('btn.addEmployee') }}</h2>
    <form @submit.prevent="handleSubmit" class="flex flex-col gap-4 w-full">
      <input
        type="text"
        :placeholder="$t('placeholder.firstName')"
        class="input"
        v-model="candidate.name"
      />
      <input
        type="text"
        :placeholder="$t('placeholder.lastName')"
        class="input"
        v-model="candidate.surname"
      />
      <input
        type="text"
        :placeholder="$t('placeholder.middleName')"
        class="input"
        v-model="candidate.middlename"
      />
      <input
        type="text"
        :placeholder="$t('placeholder.position')"
        class="input"
        v-model="candidate.position"
      />
      <input
        type="email"
        :placeholder="$t('placeholder.email')"
        class="input"
        v-model="candidate.email"
      />
      <div class="flex justify-end gap-2">
        <button
          type="button"
          @click="handleCancel"
          class="btn btn-secondary"
        >
          {{ $t('btn.cancel') }}
        </button>
        <button
          type="submit"
          class="btn btn-primary"
        >
          {{ $t('btn.add') }}
        </button>
      </div>
    </form>
  </div>
</template>