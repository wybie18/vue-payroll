<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'vue-sonner'
import ContentSection from './components/ContentSection.vue'
import ComboboxField from './components/ComboboxField.vue'

const auth = useAuthStore()

const profile = ref({
  first_name: '',
  last_name: '',
  middle_name: '',
  phone_number: '',
})

onMounted(() => {
  if (auth.profile) {
    profile.value = {
      first_name: auth.profile.first_name || '',
      last_name: auth.profile.last_name || '',
      middle_name: auth.profile.middle_name || '',
      phone_number: auth.profile.phone_number || '',
    }
  }
})

const isUpdating = ref(false)

async function onSubmit() {
  isUpdating.value = true
  try {
    await auth.updateProfileInfo(profile.value)
    toast.success('Profile updated successfully.')
  } catch (err: any) {
    toast.error('Failed to update profile.', { description: err.message })
  } finally {
    isUpdating.value = false
  }
}
</script>

<template>
  <ContentSection title="Profile" description="Update your personal information.">
    <form @submit.prevent="onSubmit" class="space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="firstName">First Name</Label>
          <Input id="firstName" v-model="profile.first_name" required />
        </div>

        <div class="space-y-2">
          <Label for="lastName">Last Name</Label>
          <Input id="lastName" v-model="profile.last_name" required />
        </div>

        <div class="space-y-2">
          <Label for="middleName">Middle Name</Label>
          <Input id="middleName" v-model="profile.middle_name" />
        </div>

        <div class="space-y-2">
          <Label for="phoneNumber">Phone Number</Label>
          <Input id="phoneNumber" v-model="profile.phone_number" />
        </div>
      </div>

      <Button type="submit" :disabled="isUpdating">
        {{ isUpdating ? 'Updating...' : 'Update profile' }}
      </Button>
    </form>
  </ContentSection>
</template>
