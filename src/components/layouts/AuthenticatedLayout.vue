<script setup lang="ts">
import AppSidebar from '@/components/ui/custom/sidebar/AppSidebar.vue'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset
      :class="
        cn(
          '@container/content',
          'has-data-[layout=fixed]:h-svh',
          'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]',
        )
      "
    >
      <slot />
    </SidebarInset>
  </SidebarProvider>
</template>
