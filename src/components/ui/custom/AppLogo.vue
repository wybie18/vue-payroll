<script setup lang="ts">
import { computed } from 'vue'

interface LogoProps {
  alt?: string
  class?: string
}

const props = withDefaults(defineProps<LogoProps>(), {
  alt: 'SFADS Logo',
  class: '',
})
</script>

<template>
  <img
    src="@/assets/images/logo/sfads-logo.png"
    :alt="alt"
    :class="['object-contain h-auto', props.class]"
  />
</template>
