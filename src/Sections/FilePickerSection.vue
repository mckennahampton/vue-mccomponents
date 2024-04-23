<script setup lang="ts">
import { ref } from 'vue'
import FilePicker from '../../lib/Inputs/FilePicker.vue'

const props = defineProps<{
    dark: boolean,
}>()

const simpleModel = ref<File[]>([])

</script>
<template>
    <div class="w-full flex flex-col gap-4">
        <h2 class="text-2xl">File Pickers</h2>
        <div class="w-full flex items-start gap-10">

            <!-- Simple -->
            <div class="flex flex-col gap-5">
                <FilePicker
                    v-model="simpleModel"
                    label="Simple"
                    :dark="props.dark"
                />
                {{ simpleModel }}
            </div>

        </div>
    </div>
</template>