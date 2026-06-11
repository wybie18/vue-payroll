<script setup lang="ts">
import { cn } from '@/lib/utils'
import 'vue-sonner/style.css'
import { Toaster } from 'vue-sonner'

interface MainProps {
  class?: string
  fixed?: boolean
  fluid?: boolean
}

const props = withDefaults(defineProps<MainProps>(), {
  fixed: false,
  fluid: false,
})
</script>

<template>
  <main
    :data-layout="props.fixed ? 'fixed' : 'auto'"
    :class="
      cn(
        'px-4 py-6',
        props.fixed && 'flex grow flex-col overflow-hidden',
        !props.fluid && '@7xl/content:mx-auto @7xl/content:w-full @7xl/content:max-w-7xl',
        props.class,
      )
    "
  >
    <slot />
  </main>
  <Toaster position="top-right" />
</template>
