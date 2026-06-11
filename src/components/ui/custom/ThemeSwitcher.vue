<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Check, Moon, Sun } from '@lucide/vue'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useColorMode } from '@vueuse/core'

const mode = useColorMode()

const theme = computed({
  get: () => (mode.value === 'auto' ? 'system' : mode.value) as 'light' | 'dark' | 'system',
  set: (val) => {
    mode.value = val === 'system' ? 'auto' : val
  },
})

function setTheme(value: 'light' | 'dark' | 'system') {
  theme.value = value
}

watch(
  mode,
  (val) => {
    const isDark =
      val === 'dark' ||
      (val === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    const themeColor = isDark ? '#020817' : '#fff'
    const metaThemeColor = document.querySelector("meta[name='theme-color']")
    if (metaThemeColor) metaThemeColor.setAttribute('content', themeColor)
  },
  { immediate: true },
)
</script>

<template>
  <DropdownMenu :modal="false">
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon" class="scale-95 rounded-full">
        <Sun class="size-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon
          class="absolute size-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
        />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @click="setTheme('light')">
        Light
        <Check :size="14" :class="cn('ms-auto', theme !== 'light' && 'hidden')" />
      </DropdownMenuItem>
      <DropdownMenuItem @click="setTheme('dark')">
        Dark
        <Check :size="14" :class="cn('ms-auto', theme !== 'dark' && 'hidden')" />
      </DropdownMenuItem>
      <DropdownMenuItem @click="setTheme('system')">
        System
        <Check :size="14" :class="cn('ms-auto', theme !== 'system' && 'hidden')" />
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
