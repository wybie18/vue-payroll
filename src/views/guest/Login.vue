<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AppLogo from '@/components/ui/custom/AppLogo.vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { ArrowLeft, CheckCircle2 } from '@lucide/vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

// ─── Login State ──────────────────────────────────────────────────────────────

const email = ref('')
const password = ref('')

async function handleLogin() {
  try {
    await auth.login(email.value, password.value)
    let redirect = (route.query.redirect as string) || '/dashboard'

    if (redirect === '/setup-account') {
      redirect = '/dashboard'
    }

    router.push(redirect)
  } catch {}
}

// ─── Forgot Password State ────────────────────────────────────────────────────

type ForgotStep = 'email' | 'otp' | 'new-password' | 'success'

const showForgotPassword = ref(false)
const forgotStep = ref<ForgotStep>('email')
const forgotEmail = ref('')
const otpValue = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const forgotLoading = ref(false)
const forgotError = ref<string | null>(null)

const passwordsMatch = computed(() => newPassword.value === confirmPassword.value)
const canSubmitNewPassword = computed(
  () => newPassword.value.length >= 6 && confirmPassword.value.length >= 6 && passwordsMatch.value,
)

function openForgotPassword() {
  auth.clearError()
  forgotError.value = null
  forgotStep.value = 'email'
  forgotEmail.value = ''
  otpValue.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  showForgotPassword.value = true
}

function closeForgotPassword() {
  showForgotPassword.value = false
  forgotError.value = null
  auth.clearError()
}

async function handleSendOtp() {
  forgotLoading.value = true
  forgotError.value = null
  try {
    await auth.sendResetOtp(forgotEmail.value)
    forgotStep.value = 'otp'
  } catch (err: any) {
    forgotError.value = err.message || 'Failed to send reset code.'
  } finally {
    forgotLoading.value = false
  }
}

async function handleVerifyOtpAndReset() {
  if (!passwordsMatch.value) {
    forgotError.value = 'Passwords do not match.'
    return
  }
  forgotLoading.value = true
  forgotError.value = null
  try {
    await auth.resetPasswordViaOtp(forgotEmail.value, otpValue.value, newPassword.value)
    forgotStep.value = 'success'
  } catch (err: any) {
    forgotError.value = err.message || 'Failed to reset password.'
  } finally {
    forgotLoading.value = false
  }
}

function handleOtpComplete(value: string) {
  otpValue.value = value
  forgotStep.value = 'new-password'
}

function goBackToLogin() {
  closeForgotPassword()
}
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-background p-4 md:p-8">
    <!-- Login Form -->
    <Card v-if="!showForgotPassword" class="w-full max-w-sm">
      <CardHeader class="text-center">
        <AppLogo class="mx-auto mb-4 w-24" />
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>Enter your email below to login to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleLogin">
          <div class="grid w-full items-center gap-4">
            <div class="flex flex-col space-y-1.5">
              <Label for="email">Email</Label>
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="m@example.com"
                autocomplete="email"
                required
              />
            </div>
            <div class="flex flex-col space-y-1.5">
              <div class="flex items-center">
                <Label for="password">Password</Label>
                <button
                  type="button"
                  class="ml-auto inline-block text-sm underline cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                  @click="openForgotPassword"
                >
                  Forgot your password?
                </button>
              </div>
              <Input
                id="password"
                v-model="password"
                type="password"
                autocomplete="current-password"
                required
              />
            </div>

            <!-- Error message -->
            <p v-if="auth.error" class="text-sm text-red-500">
              {{ auth.error }}
            </p>
          </div>
          <Button type="submit" class="w-full mt-6" :disabled="auth.loading">
            {{ auth.loading ? 'Logging in...' : 'Login' }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <!-- Forgot Password Flow -->
    <Card v-else class="w-full max-w-sm">
      <CardHeader class="text-center">
        <AppLogo class="mx-auto mb-4 w-24" />

        <template v-if="forgotStep === 'email'">
          <CardTitle>Forgot password</CardTitle>
          <CardDescription>Enter your email to receive a reset code</CardDescription>
        </template>
        <template v-else-if="forgotStep === 'otp'">
          <CardTitle>Enter verification code</CardTitle>
          <CardDescription>
            We sent an 8-digit code to
            <span class="font-medium text-foreground">{{ forgotEmail }}</span>
          </CardDescription>
        </template>
        <template v-else-if="forgotStep === 'new-password'">
          <CardTitle>Set new password</CardTitle>
          <CardDescription>Enter and confirm your new password</CardDescription>
        </template>
        <template v-else-if="forgotStep === 'success'">
          <CardTitle>Password reset successful</CardTitle>
          <CardDescription>
            Your password has been updated. You can now log in with your new password.
          </CardDescription>
        </template>
      </CardHeader>

      <CardContent>
        <!-- Step 1: Email -->
        <form v-if="forgotStep === 'email'" @submit.prevent="handleSendOtp">
          <div class="grid w-full items-center gap-4">
            <div class="flex flex-col space-y-1.5">
              <Label for="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                v-model="forgotEmail"
                type="email"
                placeholder="m@example.com"
                autocomplete="email"
                required
              />
            </div>

            <p v-if="forgotError" class="text-sm text-red-500">{{ forgotError }}</p>
          </div>

          <Button type="submit" class="w-full mt-6" :disabled="forgotLoading">
            {{ forgotLoading ? 'Sending code...' : 'Send reset code' }}
          </Button>

          <Button type="button" variant="ghost" class="w-full mt-2" @click="goBackToLogin">
            <ArrowLeft class="size-4 mr-2" />
            Back to login
          </Button>
        </form>

        <!-- Step 2: OTP -->
        <div v-else-if="forgotStep === 'otp'" class="flex flex-col items-center gap-4">
          <InputOTP v-model="otpValue" :maxlength="8" @complete="handleOtpComplete">
            <InputOTPGroup>
              <InputOTPSlot :index="0" />
              <InputOTPSlot :index="1" />
              <InputOTPSlot :index="2" />
              <InputOTPSlot :index="3" />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot :index="4" />
              <InputOTPSlot :index="5" />
              <InputOTPSlot :index="6" />
              <InputOTPSlot :index="7" />
            </InputOTPGroup>
          </InputOTP>

          <p class="text-xs text-muted-foreground text-center">
            Didn't receive a code?
            <button
              type="button"
              class="underline cursor-pointer text-foreground hover:text-primary transition-colors"
              :disabled="forgotLoading"
              @click="handleSendOtp"
            >
              Resend
            </button>
          </p>

          <p v-if="forgotError" class="text-sm text-red-500">{{ forgotError }}</p>

          <Button type="button" variant="ghost" class="w-full mt-2" @click="goBackToLogin">
            <ArrowLeft class="size-4 mr-2" />
            Back to login
          </Button>
        </div>

        <!-- Step 3: New Password -->
        <form v-else-if="forgotStep === 'new-password'" @submit.prevent="handleVerifyOtpAndReset">
          <div class="grid w-full items-center gap-4">
            <div class="flex flex-col space-y-1.5">
              <Label for="new-password">New Password</Label>
              <Input
                id="new-password"
                v-model="newPassword"
                type="password"
                autocomplete="new-password"
                required
              />
            </div>
            <div class="flex flex-col space-y-1.5">
              <Label for="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                v-model="confirmPassword"
                type="password"
                autocomplete="new-password"
                required
              />
              <p v-if="confirmPassword && !passwordsMatch" class="text-sm text-red-500">
                Passwords do not match.
              </p>
            </div>

            <p v-if="forgotError" class="text-sm text-red-500">{{ forgotError }}</p>
          </div>

          <Button
            type="submit"
            class="w-full mt-6"
            :disabled="forgotLoading || !canSubmitNewPassword"
          >
            {{ forgotLoading ? 'Resetting password...' : 'Reset password' }}
          </Button>

          <Button type="button" variant="ghost" class="w-full mt-2" @click="goBackToLogin">
            <ArrowLeft class="size-4 mr-2" />
            Back to login
          </Button>
        </form>

        <!-- Step 4: Success -->
        <div v-else-if="forgotStep === 'success'" class="flex flex-col items-center gap-4">
          <CheckCircle2 class="w-16 h-16 text-green-500" />
          <Button class="w-full" @click="goBackToLogin"> Back to login </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
