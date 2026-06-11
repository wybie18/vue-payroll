<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useColorMode } from '@vueuse/core'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import ContentSection from './components/ContentSection.vue'

const mode = useColorMode()

const font = ref(localStorage.getItem('app-font') || 'Inter')
const fonts = ['Inter', 'Roboto', 'Outfit', 'System']

watchEffect(() => {
  localStorage.setItem('app-font', font.value)
  if (font.value === 'System') {
    document.body.style.fontFamily = 'system-ui, sans-serif'
  } else {
    document.body.style.fontFamily = `"${font.value}", sans-serif`
  }
})
</script>

<template>
  <ContentSection
    title="Appearance"
    description="Customize the appearance of the app. Automatically switch between day and night themes."
  >
    <div class="space-y-8">
      <div class="space-y-2">
        <Label>Font</Label>
        <Select v-model="font">
          <SelectTrigger class="w-50">
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="f in fonts" :key="f" :value="f">
              {{ f }}
            </SelectItem>
          </SelectContent>
        </Select>
        <p class="text-[0.8rem] text-muted-foreground">
          Set the font you want to use in the dashboard.
        </p>
      </div>

      <div class="space-y-2">
        <Label>Theme</Label>
        <p class="text-[0.8rem] text-muted-foreground">Select the theme for the dashboard.</p>

        <RadioGroup v-model="mode" class="grid max-w-md grid-cols-2 gap-8 pt-2">
          <!-- Light Theme Option -->
          <Label class="[&:has([data-state=checked])>div]:border-primary">
            <RadioGroupItem value="light" class="sr-only" />
            <div
              class="items-center rounded-md border-2 border-muted p-1 hover:border-accent cursor-pointer"
            >
              <div class="space-y-2 rounded-sm bg-[#ecedef] p-2">
                <div class="space-y-2 rounded-md bg-white p-2 shadow-sm">
                  <div class="h-2 w-20 rounded-lg bg-[#ecedef]"></div>
                  <div class="h-2 w-25 rounded-lg bg-[#ecedef]"></div>
                </div>
                <div class="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                  <div class="h-4 w-4 rounded-full bg-[#ecedef]"></div>
                  <div class="h-2 w-25 rounded-lg bg-[#ecedef]"></div>
                </div>
                <div class="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                  <div class="h-4 w-4 rounded-full bg-[#ecedef]"></div>
                  <div class="h-2 w-25 rounded-lg bg-[#ecedef]"></div>
                </div>
              </div>
            </div>
            <span class="block w-full p-2 text-center font-normal">Light</span>
          </Label>

          <!-- Dark Theme Option -->
          <Label class="[&:has([data-state=checked])>div]:border-primary">
            <RadioGroupItem value="dark" class="sr-only" />
            <div
              class="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground cursor-pointer"
            >
              <div class="space-y-2 rounded-sm bg-slate-950 p-2">
                <div class="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                  <div class="h-2 w-20 rounded-lg bg-slate-400"></div>
                  <div class="h-2 w-25 rounded-lg bg-slate-400"></div>
                </div>
                <div class="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                  <div class="h-4 w-4 rounded-full bg-slate-400"></div>
                  <div class="h-2 w-25 rounded-lg bg-slate-400"></div>
                </div>
                <div class="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                  <div class="h-4 w-4 rounded-full bg-slate-400"></div>
                  <div class="h-2 w-25 rounded-lg bg-slate-400"></div>
                </div>
              </div>
            </div>
            <span class="block w-full p-2 text-center font-normal">Dark</span>
          </Label>
        </RadioGroup>
      </div>
    </div>
  </ContentSection>
</template>
