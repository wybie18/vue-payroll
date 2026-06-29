<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { getFullName } from '@/helpers/fullname.helper'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  ChevronUp,
  LayoutDashboard,
  LogOut,
  ClipboardList,
  Users,
  Settings,
  Building2,
  Calculator,
  CalendarClock,
  FileText,
  Landmark,
  CreditCard,
  UserCog,
  Settings2,
  Layers,
  FileSignature,
} from '@lucide/vue'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

import {
  Sidebar,
  SidebarFooter,
  SidebarRail,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/stores/auth'
import AppTitle from './AppTitle.vue'

const { state } = useSidebar()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const userFullName = computed(() => {
  const p = authStore.profile
  if (!p) return ''
  return getFullName(p.first_name, p.middle_name, p.last_name) || authStore.userEmail
})

const userInitials = computed(() => {
  const p = authStore.profile
  if (!p) return 'U'
  return `${p.first_name?.[0] || ''}${p.last_name?.[0] || ''}`.toUpperCase() || 'U'
})

// Centralized Menu Configuration
const MENU_GROUPS = [
  {
    label: 'General',
    items: [{ title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Payroll',
    items: [
      { title: 'Payroll Periods', url: '/payroll/periods', icon: CalendarClock },
      { title: 'Payroll Preparation', url: '/payroll/preparation', icon: Layers },
      { title: 'ADA Preparation', url: '/payroll/ada', icon: FileSignature },
    ],
  },
  {
    label: 'Records',
    items: [
      { title: 'Employees', url: '/employees', icon: Users },
      { title: 'Offices', url: '/offices', icon: Building2 },
      { title: 'Banks & Accounts', url: '/banks', icon: Landmark },
    ],
  },
  {
    label: 'System',
    items: [{ title: 'Audit Logs', url: '/audit-logs', icon: ClipboardList }],
  },
]

function canShowRoute(url: string): boolean {
  const routeRecord = router.getRoutes().find((r) => r.path === url)
  if (routeRecord?.meta?.roles) {
    return authStore.userHasRole(routeRecord.meta.roles)
  }
  return true
}

const menuGroups = computed(() => {
  return MENU_GROUPS.map((group) => {
    const filteredItems = group.items.filter((item) => canShowRoute(item.url))
    return {
      ...group,
      items: filteredItems,
    }
  }).filter((group) => group.items.length > 0)
})

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <Sidebar side="left" collapsible="icon" variant="inset">
    <SidebarHeader>
      <AppTitle />
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup v-for="group in menuGroups" :key="group.label">
        <SidebarGroupLabel v-if="state === 'expanded'">{{ group.label }}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in group.items" :key="item.title">
              <SidebarMenuButton
                :isActive="route.path.startsWith(item.url)"
                :tooltip="item.title"
                as-child
              >
                <RouterLink :to="item.url" class="flex gap-2 w-full">
                  <component v-if="item.icon" :is="item.icon" class="size-4" />
                  <span>{{ item.title }}</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter class="shrink-0 border-t bg-sidebar">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <SidebarMenuButton
                size="lg"
                class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
              >
                <Avatar class="h-8 w-8 rounded-lg">
                  <AvatarFallback class="rounded-lg">{{ userInitials }}</AvatarFallback>
                </Avatar>

                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-semibold">{{ userFullName }}</span>
                  <span class="truncate text-xs">{{ authStore.userEmail }}</span>
                </div>
                <ChevronUp class="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="top"
              align="end"
              class="w-[--reka-popper-anchor-width] min-w-56 rounded-lg"
            >
              <DropdownMenuLabel class="p-0 font-normal">
                <div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                  <Avatar class="h-8 w-8 rounded-lg">
                    <AvatarFallback class="rounded-lg">{{ userInitials }}</AvatarFallback>
                  </Avatar>
                  <div class="grid flex-1 text-start text-sm leading-tight">
                    <p class="truncate font-semibold">{{ userFullName }}</p>
                    <p class="truncate text-xs">{{ authStore.userEmail }}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem v-if="canShowRoute('/settings')" as-child class="cursor-pointer">
                <RouterLink to="/settings" class="flex w-full items-center">
                  <Settings class="mr-2 size-4" />
                  <span>Settings</span>
                </RouterLink>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem class="text-red-600 cursor-pointer" @click="handleLogout">
                <LogOut class="mr-2 size-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>
</template>
