<script setup lang="ts">
import Main from '@/components/layouts/Main.vue'
import Header from '@/components/ui/custom/Header.vue'
import ThemeSwitcher from '@/components/ui/custom/ThemeSwitcher.vue'
import { Separator } from '@/components/ui/separator'
import { User, Wrench, Palette } from '@lucide/vue'
import SidebarNav from './SidebarNav.vue'

const sidebarNavItems = [
  {
    title: 'Profile',
    href: '/settings/profile',
    icon: User,
  },
  {
    title: 'Account',
    href: '/settings/account',
    icon: Wrench,
  },
  {
    title: 'Appearance',
    href: '/settings/appearance',
    icon: Palette,
  },
]
</script>

<template>
  <Header :fixed="true">
    <div class="ml-auto flex items-center gap-2">
      <ThemeSwitcher />
    </div>
  </Header>

  <Main :fixed="true">
    <div class="space-y-0.5">
      <h2 class="text-2xl font-bold tracking-tight md:text-3xl">Settings</h2>
      <p class="text-muted-foreground">Manage your account settings and set e-mail preferences.</p>
    </div>
    <Separator class="my-4 lg:my-6" />
    <div
      class="flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12"
    >
      <aside class="top-0 lg:sticky lg:w-1/5">
        <SidebarNav :items="sidebarNavItems" />
      </aside>
      <div class="flex w-full overflow-y-hidden p-1">
        <RouterView />
      </div>
    </div>
  </Main>
</template>
