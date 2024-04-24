<script setup lang="ts">
import { computed, onBeforeMount } from 'vue'
import { Extension } from './Types/Extensions'
import { camelCase } from './Utilities/stringHelpers'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import * as solidIcons from '@fortawesome/free-solid-svg-icons'
import * as brandIcons from '@fortawesome/free-brands-svg-icons'
import * as regularIcons from '@fortawesome/free-regular-svg-icons'

interface Props {
    iconClass?: string,
    extension?: Extension
}
const props = defineProps<Props>()

const fileIcons = {
    'pdf': 'fas fa-file-pdf',
    'jpeg': 'fas fa-file-image',
    'jpg': 'fas fa-file-image',
    'jfif': 'fas fa-file-image',
    'png': 'fas fa-file-image',
    'webp': 'fas fa-file-image',
    'xlsx': 'fas fa-file-excel',
    'docx': 'fas fa-file-word',
    'mov': 'fas fa-file-video',
    'mp4': 'fas fa-file-video',
    'zip': 'fas fa-file-archive',
    '7z': 'fas fa-file-archive',
    'mp3': 'fas fa-file-audio',
    'wav': 'fas fa-file-audio',
    'html': 'fas fa-file-code',
    'csv': 'fas fa-file-csv',
    'pptx': 'fas fa-file-powerpoint'
}

const fileIconColors = {
    'pdf': 'text-red-500',
    'jpeg': 'text-amber-500',
    'jpg': 'text-amber-500',
    'jfif': 'text-amber-500',
    'png': 'text-amber-500',
    'webp': 'text-amber-500',
    'xlsx': 'text-green-500',
    'docx': 'text-blue-600',
    'mov': 'text-orange-500',
    'mp4': 'text-orange-500',
    'mp3': 'text-orange-500',
    'wav': 'text-orange-500',
    'csv': 'text-green-500',
    'pptx': 'text-orange-600'
}

const icon = computed(() => {
    return props.extension
    ? fileIcons[props.extension] ?? 'fas fa-file-alt'
    : props.iconClass
})

const extensionColor = computed(() => {
    return props.extension
    ? fileIconColors[props.extension as keyof object] ?? 'text-black'
    : null
})


const splitString = computed(() => icon.value?.split(" "))
const iconStyle = computed(() => {
    if (splitString.value) return splitString.value[0].toString()
    else return false
})
const iconName = computed(() => {
    if (splitString.value) return splitString.value[splitString.value.length - 1].toString().substring(3)
    else return false
})

onBeforeMount(() => {
    if (iconStyle.value && iconName.value)
    {
        if (iconStyle.value == 'fas' || iconStyle.value == 'fa-solid')
        {
            library.add(solidIcons[camelCase(`fa-${iconName.value}`) as keyof object])
        }

        else if (iconStyle.value == 'fab' || iconStyle.value == 'fa-brand')
        {
            library.add(brandIcons[camelCase(`fa-${iconName.value}`) as keyof object])
        }

        else
        {
            library.add(regularIcons[camelCase(`fa-${iconName.value}`) as keyof object])
        }
    }
})

</script>
<template>
    <FontAwesomeIcon :icon="[iconStyle, iconName]" :class="extensionColor" />
</template>