import { defineStore } from 'pinia'
import type { BonusCalculation, BonusRule, BonusVariables } from '~~/types/bonus'
import { useOrganizationStore } from '~/stores/organization'

export type BonusRulePayload = {
  name: string
  scope: BonusRule['scope']
  formula: string
  positionId: number | null
  employeeId: string | null
}

export const useBonusStore = defineStore('bonus', () => {
  const organizationStore = useOrganizationStore()
  const rules = ref<BonusRule[]>([])
  const calculation = ref<BonusCalculation | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function load(month: string) {
    const organizationId = organizationStore.currentOrganizationId
    if (!organizationId) return

    isLoading.value = true
    error.value = null
    try {
      const [nextRules, nextCalculation] = await Promise.all([
        $fetch<BonusRule[]>('/api/bonus/rules', {
          credentials: 'include',
          query: { organizationId, month },
        }),
        $fetch<BonusCalculation>('/api/bonus/calculate', {
          credentials: 'include',
          query: { organizationId, month },
        }),
      ])
      rules.value = nextRules
      calculation.value = nextCalculation
    } catch (requestError) {
      error.value = String(requestError)
      throw requestError
    } finally {
      isLoading.value = false
    }
  }

  async function saveRule(payload: BonusRulePayload, id?: number) {
    const organizationId = organizationStore.currentOrganizationId
    if (!organizationId) return

    const saved = await $fetch<BonusRule>(id ? `/api/bonus/rules/${id}` : '/api/bonus/rules', {
      credentials: 'include',
      method: id ? 'PATCH' : 'POST',
      query: { organizationId },
      body: payload,
    })
    return saved
  }

  async function removeRule(id: number) {
    const organizationId = organizationStore.currentOrganizationId
    if (!organizationId) return

    await $fetch(`/api/bonus/rules/${id}`, {
      credentials: 'include',
      method: 'DELETE',
      query: { organizationId },
    })
  }

  async function saveVariables(ruleId: number, month: string, variables: BonusVariables) {
    const organizationId = organizationStore.currentOrganizationId
    if (!organizationId) return

    await $fetch('/api/bonus/month', {
      credentials: 'include',
      method: 'PATCH',
      query: { organizationId },
      body: { ruleId, month, variables },
    })
  }

  return { rules, calculation, isLoading, error, load, saveRule, removeRule, saveVariables }
})
