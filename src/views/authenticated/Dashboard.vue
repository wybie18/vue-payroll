<script setup lang="ts">
import Main from '@/components/layouts/Main.vue'
import Header from '@/components/ui/custom/Header.vue'
import ThemeSwitcher from '@/components/ui/custom/ThemeSwitcher.vue'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
</script>

<template>
  <Header :fixed="true">
    <div class="ml-auto flex items-center gap-2">
      <ThemeSwitcher />
    </div>
  </Header>
  <Main class="flex flex-1 flex-col gap-4 sm:gap-6">
    <div class="mb-2 flex items-center justify-between space-y-2">
      <h1 class="text-2xl font-bold tracking-tight">Dashboard</h1>
      <div class="flex items-center space-x-2">
        <Button @click="$router.push('/reports')">View Reports</Button>
      </div>
    </div>
    <Tabs orientation="vertical" defaultValue="overview" className="space-y-4">
      <div className="w-full overflow-x-auto pb-2">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="daily-records">Daily Records</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="daily-records" className="space-y-4">
        <div>
          <p class="text-muted-foreground">Sample overview content 2.</p>
        </div>
      </TabsContent>
      <TabsContent value="overview" className="space-y-4">
        <div>
          <p class="text-muted-foreground">Sample overview content.</p>
        </div>
      </TabsContent>
    </Tabs>
  </Main>
</template>
