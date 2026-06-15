<script setup lang="ts">
import { computed } from 'vue'
import { VisSingleContainer, VisDonut } from '@unovis/vue'
import { Donut } from '@unovis/ts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { componentToString } from '@/components/ui/chart/utils'
import type { ChartConfig } from '@/components/ui/chart'

const props = withDefaults(
  defineProps<{
    data: any[]
    categoryKey?: string
    labelKey?: string
    valueKey?: string
  }>(),
  {
    categoryKey: 'office',
    labelKey: 'office_name',
    valueKey: 'total_pay',
  },
)

function resolveCssVar(variable: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
}

const resolvedColors = computed(() =>
  props.data.map((_, index) => resolveCssVar(`--chart-${(index % 5) + 1}`)),
)

const config = computed<ChartConfig>(() => {
  const cfg: ChartConfig = {
    [props.valueKey]: {
      label: props.valueKey.charAt(0).toUpperCase() + props.valueKey.slice(1),
    },
  }
  props.data.forEach((d, index) => {
    const category = String(d[props.categoryKey])
    cfg[category] = {
      label: String(d[props.labelKey] ?? d[props.categoryKey]),
      color: resolvedColors.value[index],
    }
  })
  return cfg
})

const valueAccessor = (d: any) => Number(d[props.valueKey])

const colorAccessor = (_d: any, index: number) =>
  resolvedColors.value[index] ?? resolvedColors.value[0]
</script>

<template>
  <ChartContainer :config="config" class="h-64 w-full">
    <VisSingleContainer :data="props.data" class="w-full h-full max-h-64">
      <VisDonut
        :value="valueAccessor"
        :color="colorAccessor"
        :arc-width="40"
        :show-background="false"
      />
      <ChartTooltip
        :triggers="{
          [Donut.selectors.segment]: componentToString(config, ChartTooltipContent, {
            labelKey: props.categoryKey,
          })!,
        }"
      />
    </VisSingleContainer>
  </ChartContainer>
</template>