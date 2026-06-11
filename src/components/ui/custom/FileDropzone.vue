<script setup lang="ts">
import { ref, watch } from 'vue'
import { FileUp, FileSpreadsheet } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'

const props = withDefaults(
  defineProps<{
    accept?: string
    fileName?: string
    description?: string
    successMessage?: string
  }>(),
  {
    accept: '.csv',
    fileName: '',
    description: 'Drag and drop your file here',
    successMessage: 'File parsed successfully',
  },
)

const emit = defineEmits<{
  'update:fileName': [value: string]
  change: [file: File]
  clear: []
}>()

const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

watch(
  () => props.fileName,
  (newVal) => {
    if (!newVal && fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  },
)

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (!file) return

  const allowedExtensions = props.accept.split(',').map((ext) => ext.trim().toLowerCase())
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()

  if (props.accept && !allowedExtensions.includes(fileExtension)) {
    toast.error(`Invalid file type. Allowed formats: ${props.accept}`)
    return
  }

  processFile(file)
}

const processFile = (file: File) => {
  emit('update:fileName', file.name)
  emit('change', file)
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  processFile(file)
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const removeFile = () => {
  emit('update:fileName', '')
  emit('clear')
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}
</script>

<template>
  <div
    class="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 min-h-[180px]"
    :class="[
      isDragging
        ? 'border-primary bg-primary/5'
        : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/10',
      fileName ? 'border-solid border-primary bg-primary/5' : '',
    ]"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @click="triggerFileInput"
  >
    <input
      type="file"
      :accept="accept"
      ref="fileInputRef"
      class="hidden"
      @change="handleFileSelect"
    />

    <div v-if="!fileName" class="flex flex-col items-center text-center space-y-2">
      <div class="p-3 bg-muted rounded-full text-muted-foreground">
        <slot name="icon">
          <FileUp :size="24" />
        </slot>
      </div>
      <div>
        <p class="text-sm font-semibold">{{ description }}</p>
        <p class="text-xs text-muted-foreground mt-1">or click to browse from your device</p>
      </div>
    </div>

    <div v-else class="flex flex-col items-center text-center space-y-3 w-full">
      <div class="p-3 bg-primary/10 text-primary rounded-full">
        <slot name="success-icon">
          <FileSpreadsheet :size="24" />
        </slot>
      </div>
      <div class="space-y-1">
        <p class="text-sm font-semibold truncate max-w-xs mx-auto">{{ fileName }}</p>
        <p class="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          {{ successMessage }}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        class="text-destructive hover:bg-destructive/10 h-8 gap-1"
        @click.stop="removeFile"
      >
        Remove File
      </Button>
    </div>
  </div>
</template>
