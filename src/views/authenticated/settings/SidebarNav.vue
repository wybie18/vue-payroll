<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface NavItem {
  href: string
  title: string
  icon: any
}

const props = defineProps<{
  items: NavItem[]
  class?: string
}>()

const route = useRoute()
const router = useRouter()

const val = computed({
  get: () => route.path,
  set: (v: string) => router.push(v),
})
</script>

<template>
  <div :class="props.class">
    <!-- Mobile Navigation (Dropdown) -->
    <div class="p-1 md:hidden">
      <Select v-model="val">
        <SelectTrigger class="h-12 sm:w-48">
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="item in items" :key="item.href" :value="item.href">
            <div class="flex gap-x-4 px-2 py-1 items-center">
              <span class="scale-125">
                <component :is="item.icon" class="size-4" />
              </span>
              <span class="text-md">{{ item.title }}</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Desktop Navigation (List) -->
    <ScrollArea
      orientation="horizontal"
      class="hidden w-full min-w-40 bg-background px-1 py-2 md:block"
    >
      <nav :class="cn('flex space-x-2 py-1 lg:flex-col lg:space-y-1 lg:space-x-0')">
        <RouterLink
          v-for="item in items"
          :key="item.href"
          :to="item.href"
          :class="
            cn(
              buttonVariants({ variant: 'ghost' }),
              route.path === item.href
                ? 'bg-muted hover:bg-accent'
                : 'hover:bg-accent hover:underline',
              'justify-start',
            )
          "
        >
          <span class="me-2">
            <component :is="item.icon" class="size-4" />
          </span>
          {{ item.title }}
        </RouterLink>
      </nav>
    </ScrollArea>
  </div>
</template>
