<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useColorMode } from '@vueuse/core'
import GuestLayout from '@/components/layouts/GuestLayout.vue'
import AuthenticatedLayout from '@/components/layouts/AuthenticatedLayout.vue'
useColorMode()
const route = useRoute()

const layouts = {
  auth: AuthenticatedLayout,
  guest: GuestLayout,
}

const currentLayout = computed(() => {
  const layoutName = (route.meta.layout as string) || 'guest'
  return layouts[layoutName as keyof typeof layouts]
})
</script>

<template>
  <component :is="currentLayout" v-bind="route.meta.layoutProps || {}">
    <RouterView />
  </component>
</template>
