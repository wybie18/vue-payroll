<script setup lang="ts">
import logoUrl from '@/assets/images/logo/sfads-logo.png'
</script>

<template>
  <div class="gov-header">
    <img :src="logoUrl" alt="SFADS Logo" class="gov-logo" />
    <div>
      <p class="font-medium text-md">REPUBLIC OF THE PHILIPPINES</p>
      <p class="font-bold text-lg">MUNICIPALITY OF SAN FRANCISCO</p>
      <p class="font-normal text-sm">San Francisco, Agusan del Sur</p>
    </div>
  </div>
</template>

<style scoped>
.gov-header {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: Arial, sans-serif;
  font-size: 10pt;
  font-weight: bold;
  line-height: 1.6;
  margin-bottom: 20px;
}

.gov-logo {
  height: 80px;
  margin-right: 20px;
}
</style>
