<script setup lang="ts">
import type { Component, HTMLAttributes } from 'vue'
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import {
  Wallet,
  Gift,
  Clock,
  Award,
  Layers,
  RotateCcw,
  Banknote,
  Coins,
} from '@lucide/vue'
import { cn } from '@/lib/utils'
import { COMPENSATION_LABELS } from '@/helpers/constants'

export type CompensationTypeKey = keyof typeof COMPENSATION_LABELS

export interface CompensationStyleConfig {
  label: string
  icon: Component
  badgeClass: string
}

const COMPENSATION_CONFIGS: Record<CompensationTypeKey, CompensationStyleConfig> = {
  allowance: {
    label: 'Allowance',
    icon: Wallet,
    badgeClass:
      'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300 border-emerald-500/30',
  },
  bonus: {
    label: 'Bonus',
    icon: Gift,
    badgeClass:
      'bg-amber-500/15 text-amber-700 dark:bg-amber-500/25 dark:text-amber-300 border-amber-500/30',
  },
  overtime: {
    label: 'Overtime',
    icon: Clock,
    badgeClass:
      'bg-purple-500/15 text-purple-700 dark:bg-purple-500/25 dark:text-purple-300 border-purple-500/30',
  },
  honorarium: {
    label: 'Honorarium',
    icon: Award,
    badgeClass:
      'bg-blue-500/15 text-blue-700 dark:bg-blue-500/25 dark:text-blue-300 border-blue-500/30',
  },
  mixed: {
    label: 'Mixed',
    icon: Layers,
    badgeClass:
      'bg-indigo-500/15 text-indigo-700 dark:bg-indigo-500/25 dark:text-indigo-300 border-indigo-500/30',
  },
  refund: {
    label: 'Refund',
    icon: RotateCcw,
    badgeClass:
      'bg-rose-500/15 text-rose-700 dark:bg-rose-500/25 dark:text-rose-300 border-rose-500/30',
  },
  wages: {
    label: 'Wages',
    icon: Banknote,
    badgeClass:
      'bg-sky-500/15 text-sky-700 dark:bg-sky-500/25 dark:text-sky-300 border-sky-500/30',
  },
}

interface Props {
  type?: string | null
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  showIcon?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  type: null,
  variant: 'secondary',
  showIcon: true,
})

const config = computed<CompensationStyleConfig>(() => {
  const key = (props.type?.toLowerCase() || '') as CompensationTypeKey
  const found = COMPENSATION_CONFIGS[key]
  if (found) {
    return found
  }
  return {
    label: props.type || 'N/A',
    icon: Coins,
    badgeClass: 'bg-muted text-muted-foreground border-border',
  }
})

const iconComponent = computed(() => config.value.icon)
</script>

<template>
  <Badge :variant="variant" :class="cn(config.badgeClass, props.class)">
    <component :is="iconComponent" v-if="showIcon" class="size-3.5 shrink-0" />
    <span>{{ config.label }}</span>
  </Badge>
</template>
