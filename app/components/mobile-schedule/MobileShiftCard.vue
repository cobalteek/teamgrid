<script setup lang="ts">
import type { ShiftWithRelations } from '~~/types/shift'

const props = withDefaults(defineProps<{
  shift: ShiftWithRelations
  isManager: boolean
  employeeOrder?: 'surname-first' | 'name-first'
}>(), {
  employeeOrder: 'surname-first',
})

defineEmits<{ (e: 'delete', shiftId: string): void }>()

const employeeLabel = computed(() => props.employeeOrder === 'name-first'
  ? `${props.shift.employee.name} ${props.shift.employee.surname}`
  : `${props.shift.employee.surname} ${props.shift.employee.name}`)

const shiftGradient = computed(() =>
  `linear-gradient(135deg, ${props.shift.position.color} 0%, ${props.shift.employee.color} 100%)`)
</script>

<template>
  <article class="mobile-shift">
    <span class="mobile-shift__color" :style="{ background: shiftGradient }" aria-hidden="true" />
    <div class="mobile-shift__content">
      <p class="mobile-shift__position">{{ shift.position.name }}</p>
      <p class="mobile-shift__employee">{{ employeeLabel }}</p>
    </div>
    <button
      v-if="isManager"
      type="button"
      class="mobile-shift__delete"
      :aria-label="$t('btn.delete')"
      :title="$t('btn.delete')"
      @click="$emit('delete', shift.id)"
    >
      <span aria-hidden="true">&times;</span>
    </button>
  </article>
</template>
