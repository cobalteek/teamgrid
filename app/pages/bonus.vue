<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { builtInBonusVariables, type BonusScope, type BonusVariables } from '~~/types/bonus'
import { useBonusStore, type BonusRulePayload } from '~/stores/bonus'

definePageMeta({
  middleware: ['auth', 'manager'],
  layout: 'dashboard-admin',
})

const { t } = useI18n()
const organizationStore = useOrganizationStore()
const bonusStore = useBonusStore()
const employeeStore = useEmployeeStore()
const positionStore = usePositionStore()
const { rules, calculation, isLoading } = storeToRefs(bonusStore)
const { employees } = storeToRefs(employeeStore)
const { positions } = storeToRefs(positionStore)

const currentMonth = new Date().toISOString().slice(0, 7)
const month = ref(currentMonth)
const isFormOpen = ref(false)
const isSaving = ref(false)
const saveError = ref(false)
const editingId = ref<number | undefined>()
const variableDrafts = ref<Record<number, Record<string, number | string>>>({})
const form = reactive<BonusRulePayload>({
  name: '',
  scope: 'organization',
  formula: 'salary * percent / 100',
  positionId: null,
  employeeId: null,
})

const scopeOptions = computed(() => [
  { value: 'organization' as const, label: t('bonus.scopeOrganization') },
  { value: 'position' as const, label: t('bonus.scopePosition') },
  { value: 'employee' as const, label: t('bonus.scopeEmployee') },
])

const customVariableNames = (rule: (typeof rules.value)[number]) =>
  rule.variableNames.filter((name) => !builtInBonusVariables.some((builtIn) => builtIn === name))

const employeeLabel = (employee: { surname: string; name: string; middlename: string }) =>
  [employee.surname, employee.name, employee.middlename].filter(Boolean).join(' ')

const scopeLabel = (scope: BonusScope) =>
  scopeOptions.value.find((item) => item.value === scope)?.label || scope

function formatMoney(value: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(value)
}

function prepareVariableDrafts() {
  const next: Record<number, Record<string, number | string>> = {}
  for (const rule of rules.value) {
    next[rule.id] = {}
    for (const name of customVariableNames(rule)) next[rule.id]![name] = rule.variables[name] ?? ''
  }
  variableDrafts.value = next
}

async function reload() {
  try {
    await bonusStore.load(month.value)
    prepareVariableDrafts()
  } catch {
    saveError.value = true
  }
}

watch(month, reload)
watch(() => organizationStore.currentOrganizationId, reload)
onMounted(reload)

function openCreate() {
  editingId.value = undefined
  Object.assign(form, {
    name: '',
    scope: 'organization',
    formula: 'salary * percent / 100',
    positionId: null,
    employeeId: null,
  })
  isFormOpen.value = true
  saveError.value = false
}

function openEdit(rule: (typeof rules.value)[number]) {
  editingId.value = rule.id
  Object.assign(form, {
    name: rule.name,
    scope: rule.scope,
    formula: rule.formula,
    positionId: rule.positionId,
    employeeId: rule.employeeId,
  })
  isFormOpen.value = true
  saveError.value = false
}

function onScopeChange() {
  if (form.scope !== 'position') form.positionId = null
  if (form.scope !== 'employee') form.employeeId = null
}

async function saveRule() {
  isSaving.value = true
  saveError.value = false
  try {
    await bonusStore.saveRule(form, editingId.value)
    isFormOpen.value = false
    await reload()
  } catch {
    saveError.value = true
  } finally {
    isSaving.value = false
  }
}

async function deleteRule(ruleId: number) {
  if (!window.confirm(t('bonus.deleteConfirm'))) return
  try {
    await bonusStore.removeRule(ruleId)
    await reload()
  } catch {
    saveError.value = true
  }
}

async function saveVariables(ruleId: number) {
  try {
    const draft = variableDrafts.value[ruleId] || {}
    const variables: BonusVariables = Object.fromEntries(
      Object.entries(draft).map(([name, value]) => [name, Number(value)]),
    )
    await bonusStore.saveVariables(ruleId, month.value, variables)
    await reload()
  } catch {
    saveError.value = true
  }
}

useHead({ title: computed(() => `${t('bonus.title')} — TeamGrid`) })
</script>

<template>
  <section class="mx-auto w-full max-w-7xl space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-[var(--text-main)]">{{ $t('bonus.title') }}</h1>
        <p class="mt-1 text-sm text-[var(--text-muted)]">{{ $t('bonus.subtitle') }}</p>
      </div>
      <label class="flex flex-col gap-1 text-sm font-medium text-[var(--text-soft)]">
        {{ $t('bonus.month') }}
        <input
          v-model="month"
          type="month"
          class="min-h-11 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-[var(--input-text)]"
        />
      </label>
    </div>

    <div class="rounded-2xl border border-[var(--border-main)] bg-[var(--bg-context)] p-4 sm:p-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 class="text-lg font-bold text-[var(--text-main)]">{{ $t('bonus.rules') }}</h2>
          <p class="mt-1 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
            {{ $t('bonus.formulaHelp') }}
          </p>
        </div>
        <button
          type="button"
          class="min-h-11 rounded-lg bg-[var(--btn-bg)] px-4 text-sm font-semibold text-[var(--btn-text)] transition hover:bg-[var(--bg-hover-context)]"
          @click="openCreate"
        >
          {{ $t('bonus.addRule') }}
        </button>
      </div>

      <form
        v-if="isFormOpen"
        class="mt-5 grid gap-4 rounded-xl border border-[var(--border-main)] bg-[var(--input-bg)] p-4 lg:grid-cols-4"
        @submit.prevent="saveRule"
      >
        <label class="flex flex-col gap-2 text-sm font-medium text-[var(--text-soft)]">
          {{ $t('bonus.ruleName') }}
          <input
            v-model="form.name"
            required
            class="min-h-11 rounded-lg border border-[var(--input-border)] bg-[var(--bg-context)] px-3 text-[var(--input-text)]"
          />
        </label>
        <label class="flex flex-col gap-2 text-sm font-medium text-[var(--text-soft)]">
          {{ $t('bonus.scope') }}
          <select
            v-model="form.scope"
            class="min-h-11 rounded-lg border border-[var(--input-border)] bg-[var(--bg-context)] px-3 text-[var(--input-text)]"
            @change="onScopeChange"
          >
            <option v-for="option in scopeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>
        <label
          v-if="form.scope === 'position'"
          class="flex flex-col gap-2 text-sm font-medium text-[var(--text-soft)]"
        >
          {{ $t('bonus.position') }}
          <select
            v-model="form.positionId"
            required
            class="min-h-11 rounded-lg border border-[var(--input-border)] bg-[var(--bg-context)] px-3 text-[var(--input-text)]"
          >
            <option :value="null">{{ $t('select.position') }}</option>
            <option v-for="position in positions" :key="position.id" :value="position.id">
              {{ position.fullName }}
            </option>
          </select>
        </label>
        <label
          v-if="form.scope === 'employee'"
          class="flex flex-col gap-2 text-sm font-medium text-[var(--text-soft)]"
        >
          {{ $t('bonus.employee') }}
          <select
            v-model="form.employeeId"
            required
            class="min-h-11 rounded-lg border border-[var(--input-border)] bg-[var(--bg-context)] px-3 text-[var(--input-text)]"
          >
            <option :value="null">{{ $t('select.employee') }}</option>
            <option v-for="employee in employees" :key="employee.id" :value="employee.id">
              {{ employeeLabel(employee) }}
            </option>
          </select>
        </label>
        <label
          class="flex flex-col gap-2 text-sm font-medium text-[var(--text-soft)] lg:col-span-2"
        >
          {{ $t('bonus.formula') }}
          <input
            v-model="form.formula"
            required
            class="min-h-11 rounded-lg border border-[var(--input-border)] bg-[var(--bg-context)] px-3 font-mono text-sm text-[var(--input-text)]"
            placeholder="salary * percent / 100"
          />
        </label>
        <div class="flex items-end gap-2 lg:col-span-2">
          <button
            type="submit"
            class="min-h-11 rounded-lg bg-[var(--primary)] px-4 font-semibold text-white disabled:opacity-50"
            :disabled="isSaving"
          >
            {{ $t('btn.save') }}
          </button>
          <button
            type="button"
            class="min-h-11 rounded-lg border border-[var(--border-main)] px-4 font-semibold text-[var(--text-soft)]"
            @click="isFormOpen = false"
          >
            {{ $t('btn.cancel') }}
          </button>
        </div>
        <p v-if="saveError" class="text-sm text-red-600 lg:col-span-4 dark:text-red-400">
          {{ $t('bonus.saveError') }}
        </p>
      </form>

      <div
        v-if="!rules.length && !isLoading"
        class="mt-5 rounded-xl border border-dashed border-[var(--border-main)] p-6 text-center text-sm text-[var(--text-muted)]"
      >
        {{ $t('bonus.noRules') }}
      </div>
      <div v-else class="mt-5 grid gap-3">
        <article
          v-for="rule in rules"
          :key="rule.id"
          class="rounded-xl border border-[var(--border-main)] p-4"
        >
          <div class="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="font-semibold text-[var(--text-main)]">{{ rule.name }}</h3>
                <span
                  class="rounded-full bg-[var(--bg-hover-context)] px-2.5 py-1 text-xs text-[var(--text-muted)]"
                  >{{ scopeLabel(rule.scope) }}</span
                >
              </div>
              <p class="mt-2 font-mono text-sm text-[var(--text-soft)]">{{ rule.formula }}</p>
              <p class="mt-1 text-xs text-[var(--text-muted)]">
                {{
                  rule.scope === 'position'
                    ? rule.position?.fullName
                    : rule.scope === 'employee' && rule.employee
                      ? employeeLabel(rule.employee)
                      : $t('bonus.forEveryone')
                }}
              </p>
            </div>
            <div class="flex shrink-0 gap-2">
              <button
                type="button"
                class="rounded-lg border border-[var(--border-main)] px-3 py-2 text-sm font-semibold text-[var(--text-soft)] hover:text-[var(--text-blue)]"
                @click="openEdit(rule)"
              >
                {{ $t('btn.edit') }}
              </button>
              <button
                type="button"
                class="rounded-lg border border-[var(--btn-delete-bg)] px-3 py-2 text-sm font-semibold text-[var(--btn-delete-text)]"
                @click="deleteRule(rule.id)"
              >
                {{ $t('btn.delete') }}
              </button>
            </div>
          </div>
          <div
            v-if="customVariableNames(rule).length"
            class="mt-4 flex flex-col gap-3 border-t border-[var(--border-main)] pt-4 sm:flex-row sm:flex-wrap sm:items-end"
          >
            <label
              v-for="name in customVariableNames(rule)"
              :key="name"
              class="flex min-w-40 flex-col gap-1 text-xs font-semibold text-[var(--text-muted)]"
            >
              {{ name }} · {{ month }}
              <input
                v-model="variableDrafts[rule.id]![name]"
                type="number"
                step="0.01"
                class="min-h-10 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-sm text-[var(--input-text)]"
              />
            </label>
            <button
              type="button"
              class="min-h-10 rounded-lg bg-[var(--btn-bg)] px-3 text-sm font-semibold text-[var(--btn-text)]"
              @click="saveVariables(rule.id)"
            >
              {{ $t('bonus.saveVariables') }}
            </button>
          </div>
          <p v-else class="mt-3 text-xs text-[var(--text-muted)]">
            {{ $t('bonus.noCustomVariables') }}
          </p>
        </article>
      </div>
    </div>

    <div class="rounded-2xl border border-[var(--border-main)] bg-[var(--bg-context)] p-4 sm:p-6">
      <h2 class="text-lg font-bold text-[var(--text-main)]">{{ $t('bonus.calculation') }}</h2>
      <p class="mt-1 text-sm text-[var(--text-muted)]">{{ $t('bonus.automaticVariables') }}</p>
      <div v-if="calculation" class="mt-5 overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead
            class="border-b border-[var(--border-main)] text-xs tracking-wide text-[var(--text-muted)] uppercase"
          >
            <tr>
              <th class="px-3 py-3">{{ $t('bonus.employee') }}</th>
              <th class="px-3 py-3">{{ $t('bonus.position') }}</th>
              <th class="px-3 py-3 text-right">{{ $t('bonus.baseSalary') }}</th>
              <th class="px-3 py-3 text-right">{{ $t('bonus.bonus') }}</th>
              <th class="px-3 py-3 text-right">{{ $t('bonus.total') }}</th>
              <th class="px-3 py-3">{{ $t('bonus.rule') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in calculation.rows"
              :key="row.employeeId"
              class="border-b border-[var(--border-main)] last:border-0"
            >
              <td class="px-3 py-3 font-medium text-[var(--text-main)]">{{ row.employeeName }}</td>
              <td class="px-3 py-3 text-[var(--text-soft)]">{{ row.positionName || '—' }}</td>
              <td class="px-3 py-3 text-right text-[var(--text-soft)]">
                {{ formatMoney(row.baseSalary) }}
              </td>
              <td class="px-3 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                <span v-if="row.missingVariables.length" :title="row.missingVariables.join(', ')"
                  >⚠ {{ $t('bonus.missingVariables') }}</span
                >
                <span v-else>{{ formatMoney(row.bonus) }}</span>
              </td>
              <td class="px-3 py-3 text-right font-bold text-[var(--text-main)]">
                {{ formatMoney(row.total) }}
              </td>
              <td class="px-3 py-3 text-[var(--text-muted)]">{{ row.rule?.name || '—' }}</td>
            </tr>
          </tbody>
          <tfoot class="border-t-2 border-[var(--border-main)] font-bold text-[var(--text-main)]">
            <tr>
              <td colspan="2" class="px-3 py-4">{{ $t('bonus.total') }}</td>
              <td class="px-3 py-4 text-right">{{ formatMoney(calculation.totalBaseSalary) }}</td>
              <td class="px-3 py-4 text-right text-emerald-600 dark:text-emerald-400">
                {{ formatMoney(calculation.totalBonus) }}
              </td>
              <td class="px-3 py-4 text-right">{{ formatMoney(calculation.total) }}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
      <p v-else class="mt-5 text-sm text-[var(--text-muted)]">{{ $t('ui.loading') }}</p>
    </div>
  </section>
</template>
