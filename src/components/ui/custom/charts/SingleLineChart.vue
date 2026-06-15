<script setup lang="ts">
import { computed } from 'vue'
import { VisXYContainer, VisLine, VisAxis, VisArea } from '@unovis/vue'
import { CurveType } from '@unovis/ts'
import { ChartContainer, ChartCrosshair } from '@/components/ui/chart'
import { ChartTooltip, ChartTooltipContent, componentToString } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'

const props = withDefaults(
  defineProps<{
    data: any[]
    dateKey?: string
    valueKey?: string
    labelKey?: string
    label?: string
    color?: string
    showArea?: boolean
  }>(),
  {
    dateKey: 'month_sort',
    valueKey: 'total_pay',
    labelKey: 'month_label',
    label: 'Payroll',
    color: 'var(--chart-1)',
    showArea: true,
  },
)

const config = computed<ChartConfig>(() => ({
  [props.valueKey]: {
    label: props.label,
    color: props.color,
  },
}))

const chartData = computed(() => {
  return props.data
    .filter((d) => d[props.valueKey] != null)
    .map((d) => ({
      ...d,
      _x: new Date(d[props.dateKey]).getTime(),
      _y: Number(d[props.valueKey]),
    }))
    .sort((a, b) => a._x - b._x)
})

const xAccessor = (d: any) => d._x
const yAccessor = (d: any) => d._y

// Use month_label if available, otherwise format date
const tickFormat = (tick: number | Date) => {
  const ts = typeof tick === 'number' ? tick : tick.getTime()
  // Try to find matching month_label from data
  const match = chartData.value.find((d) => d._x === ts)
  if (match && match[props.labelKey]) return match[props.labelKey] as string
  return new Date(ts).toLocaleDateString('en-PH', { month: 'short', year: '2-digit' })
}

const currencyFormat = (val: number) =>
  `₱${val.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
</script>

<template>
  <ChartContainer :config="config" class="h-64 w-full">
    <VisXYContainer :data="chartData">
      <VisArea
        v-if="showArea"
        :x="xAccessor"
        :y="yAccessor"
        :color="config[valueKey]?.color"
        :curve-type="CurveType.MonotoneX"
        :opacity="0.15"
      />
      <VisLine
        :x="xAccessor"
        :y="yAccessor"
        :color="config[valueKey]?.color"
        :stroke-width="2.5"
        :curve-type="CurveType.MonotoneX"
      />
      <!-- Axes -->
      <VisAxis type="x" :x="xAccessor" :tick-format="tickFormat" :grid-line="false" />
      <VisAxis type="y" :tick-format="(val: number) => currencyFormat(val)" />

      <!-- Interactive Elements -->
      <ChartTooltip />
      <ChartCrosshair
        :template="componentToString(config, ChartTooltipContent, { labelFormatter: tickFormat })"
      />
    </VisXYContainer>
  </ChartContainer>
</template>
