<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AppLogo from '@/components/ui/custom/AppLogo.vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const router = useRouter()
const auth = useAuthStore()

const profile = ref({
  first_name: '',
  middle_name: '',
  last_name: '',
  phone_number: '',
})
const password = ref('')
const confirmPassword = ref('')

const passwordsMatch = computed(() => password.value === confirmPassword.value)

async function handleSubmit() {
  if (!passwordsMatch.value) return
  try {
    await auth.setupAccount(password.value, profile.value)
    router.push('/dashboard')
  } catch {}
}
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-background p-4 md:p-8">
    <Card class="w-full max-w-md">
      <CardHeader class="text-center">
        <AppLogo class="mx-auto mb-4 w-24" />
        <CardTitle>Set up your account</CardTitle>
        <CardDescription> Please fill in your details and set a password. </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <Label for="firstName">First Name</Label>
              <Input id="firstName" v-model="profile.first_name" required />
            </div>
            <div class="space-y-1.5">
              <Label for="lastName">Last Name</Label>
              <Input id="lastName" v-model="profile.last_name" required />
            </div>

            <div class="space-y-1.5 md:col-span-2">
              <Label for="middleName"
                >Middle Name
                <span class="text-muted-foreground font-normal">(Optional)</span></Label
              >
              <Input id="middleName" v-model="profile.middle_name" />
            </div>

            <div class="space-y-1.5 md:col-span-2">
              <Label for="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" v-model="profile.phone_number" required />
            </div>
          </div>

          <div class="space-y-1.5">
            <Label for="setup-password">Password</Label>
            <Input
              id="setup-password"
              v-model="password"
              type="password"
              autocomplete="new-password"
              required
            />
          </div>
          <div class="space-y-1.5">
            <Label for="setup-confirm-password">Confirm Password</Label>
            <Input
              id="setup-confirm-password"
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
            />
            <p v-if="confirmPassword && !passwordsMatch" class="text-sm text-red-500">
              Passwords do not match.
            </p>
          </div>
          <!-- Error message -->
          <p v-if="auth.error" class="text-sm text-red-500">
            {{ auth.error }}
          </p>

          <Button
            type="submit"
            class="w-full mt-6"
            :disabled="auth.loading || !passwordsMatch || !password"
          >
            {{ auth.loading ? 'Setting up account...' : 'Set up Account' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
