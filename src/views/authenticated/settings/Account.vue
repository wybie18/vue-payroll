<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'vue-sonner'
import ContentSection from './components/ContentSection.vue'

const auth = useAuthStore()

const password = ref('')
const confirmPassword = ref('')
const isUpdating = ref(false)

async function onSubmit() {
  if (password.value !== confirmPassword.value) {
    toast.error('Passwords do not match')
    return
  }

  if (password.value.length < 6) {
    toast.error('Password must be at least 6 characters')
    return
  }

  isUpdating.value = true
  try {
    await auth.changePassword(password.value)
    toast.success('Password updated successfully.')
    password.value = ''
    confirmPassword.value = ''
  } catch (err: any) {
    toast.error('Failed to update password.', { description: err.message })
  } finally {
    isUpdating.value = false
  }
}
</script>

<template>
  <ContentSection title="Account" description="Update your account settings. Set your password here.">
    <form @submit.prevent="onSubmit" class="space-y-8">
      <div class="space-y-2">
        <Label for="password">New Password</Label>
        <Input id="password" type="password" v-model="password" required />
        <p class="text-[0.8rem] text-muted-foreground">
          Must be at least 6 characters long.
        </p>
      </div>

      <div class="space-y-2">
        <Label for="confirm-password">Confirm Password</Label>
        <Input id="confirm-password" type="password" v-model="confirmPassword" required />
      </div>

      <Button type="submit" :disabled="isUpdating">
        {{ isUpdating ? 'Updating...' : 'Update password' }}
      </Button>
    </form>
  </ContentSection>
</template>
