<script setup lang="ts">
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import AppLogo from '../AppLogo.vue'
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <SidebarMenuButton
        size="lg"
        class="gap-0 py-0 hover:bg-transparent active:bg-transparent"
        as-child
      >
        <div>
          <AppLogo class="w-8 mr-2" />
          <div class="grid flex-1 text-start text-sm leading-tight">
            <span class="truncate font-bold">Payroll</span>
            <span class="truncate text-xs">San Francisco Agusan del Sur</span>
          </div>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
