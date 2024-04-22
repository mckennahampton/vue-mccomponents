<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import TableSection from './Sections/TableSection.vue'
import InputSection from './Sections/InputSection.vue'
import SelectSection from './Sections/SelectSection.vue'
import CheckboxSection from './Sections/CheckboxSection.vue'
import FilePickerSection from './Sections/FilePickerSection.vue'
import MultiCheckboxSection from './Sections/MultiCheckboxSection.vue'

const isDark = ref(true)
const toggleDark = () => {
    isDark.value = !isDark.value
    if (isDark.value) {
        document.querySelector('html')?.classList.add('dark')
    }
    else {
        document.querySelector('html')?.classList.remove('dark')
    }
}

onBeforeMount(() => {
    document.querySelector('html')?.classList.add('dark')
})
</script>
<template>
    <div class="w-full h-full flex flex-col gap-20 items-center justify-start text-black dark:text-white p-10">
        <div class="w-full self-start">
            <div class="p-4 m-3" @click="toggleDark">Toggle Dark</div>
        </div>

        <InputSection :dark="isDark" />
        <SelectSection :dark="isDark" />
        <FilePickerSection :dark="isDark"  />
        <TableSection :dark="isDark" />
        <CheckboxSection :dark="isDark" />
        <MultiCheckboxSection :dark="isDark" />

    </div>
</template>