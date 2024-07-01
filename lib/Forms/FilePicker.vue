<script setup lang="ts">
import VR from '../Layout/VR.vue'
import uid from '../Utilities/uid'
import Image from '../Displays/Image.vue'
import List from '../Collections/List.vue'
import { watch, computed, ref } from 'vue'
import FasFile from '../Icons/FasFile.vue'
import FileIcon from '../Icons/FileIcon.vue'
import ListItem from '../Collections/ListItem.vue'
import MutedButton from '../Buttons/MutedButton.vue'
import GlobalLabel from './Partials/GlobalLabel.vue'
import FasFileImport from '../Icons/FasFileImport.vue'
import { formatBytes } from '../Utilities/numberHelpers'
import TransitionFade from '../Transitions/TransitionFade.vue'
import { words, images, excels, powerpoints } from '../Inputs/fileTypes'

interface Props {
    multiple?: boolean,
    name?: string,
    tabindex?: number,
    type?: 'image' | 'excel' | 'word' | 'document' | 'video',
    extensions?: string[] | string,
    modelValue: File[],
    directUpload?: boolean,
    maxBytes?: number,
    dark?: boolean,
    emptyPlaceholder?: string,
    labelStyles?: any,
    renderLabel?: boolean,
    optional?: boolean,
}
const props = withDefaults(defineProps<Props>(), {
    multiple: false,
    name: 'file',
    tabindex: 1,
    directUpload: false,
    maxBytes: 15728640,
    dark: false,
    renderLabel: false,
})
const emit = defineEmits(['update:modelValue', 'upload'])

const totalSize = computed(() => {
    let bytes = 0;
    files.value.forEach(file => bytes += file.size)
    return formatBytes(bytes)
})

const totalBytes = computed(() => {
    let bytes = 0;
    files.value.forEach(file => bytes += file.size)
    return bytes
})

//#region Validation
const files = ref<File[]>([])
watch(files.value, () => emit('update:modelValue', files.value))
const totalSizePasses = computed(() => totalBytes.value < props.maxBytes)
const fileSizePasses = (size: number) => size < props.maxBytes
const allFilesPass = computed(() => files.value ? !files.value.some(file => file.size > props.maxBytes) : true)
const errored = computed(() => (!props.optional && files.value.length == 0) || !allFilesPass.value || !totalSizePasses.value)
defineExpose({
    errored
})

const validationState = computed(() => ({
    errors: [
        ... errored.value ? [props.multiple ? 'Please select at least one file' : 'Please select a file'] : [],
        ... !totalSizePasses.value ? ['Total size of files is too large'] : [],
        ... !allFilesPass.value ? ['At least one file is too large'] : [],
    ],
}))

//#endregion
const input = ref<HTMLInputElement | null>(null)
const inputUid = uid()

const id = 'file_input' + uid()
const name = (props.name ?? 'file') + (props.multiple ? '[]' : '')
const accept = computed(() => {
    if (!props.type) {
        if (props.extensions) {
            if (Array.isArray(props.extensions)) {
                let temp = [] as string[]
                props.extensions.forEach(ext => temp.push('.'+ext))
                return temp.join(',')
            }
            else {
                let temp = [] as string[]
                props.extensions.split(',').forEach(ext => temp.push('.'+ext))
                return temp.join(',')
            }
        }
        return undefined
    }
    else if (props.type == 'image') {
        return images.join(',')
    }
    else if (props.type == 'excel') {
        return excels.join(',')
    }
    else if (props.type == 'word') {
        return words.join(',')
    }
    else if (props.type == 'document') {
        let temp = words.concat(powerpoints)
        temp.push('pdf')
        return temp.join(',')
    }
    else if (props.type == 'video')
    {
        return '.mp4,.mov,.wmv,.avi,.flv,.f4v,.mkv'
    }
})

const showUpload = () => input.value?.click()

const filesSelected = async () => {

    if (!props.multiple) files.value.length = 0

    //@ts-ignore
    for (const [key, file] of Object.entries(input.value.files as File[])) {
        if (!files.value.some(_file => _file.name == file.name)) files.value.push(file)
    }

    if (input.value) input.value.value = '' // Reset the DOM input to allow for us to dynamically handle the file list
}

const removeFile = (file: File) => {
    let index = files.value.indexOf(file)
    if (index > -1) { // only splice array when item is found
        files.value.splice(index, 1) // 2nd parameter means remove one item only
    }
}

const clear = () => {
    if (input.value) input.value.value = ''
    files.value.length = 0
}

watch(files, () => emit('update:modelValue', files.value), { deep: true })

const uploadClicked = () => {
    if (validationState.value.errors.length > 0) return
    emit('upload', files.value)
}

//#region Drag & Drop
const active = ref(false)
let inActiveTimeout = ref<NodeJS.Timeout>()
const setActive = () => {
    active.value = true
    clearTimeout(inActiveTimeout.value)
}
const setInactive = () => {
    inActiveTimeout.value = setTimeout(() => active.value = false, 50)
}
const drop = (e: DragEvent) => {
    setInactive()

    if (!props.multiple) files.value.length = 0

    if (e.dataTransfer)
    {
        for (let i = 0; i < e.dataTransfer.files.length; i++)
        {
            let file = e.dataTransfer.files.item(i)
            if (file && !files.value.some(_file => _file.name == file.name)) files.value.push(file)
            if (!props.multiple) break
        }
    }

    if (input.value) input.value.value = '' // Reset the DOM input to allow for us to dynamically handle the file list
}
//#endregion
</script>
<template>
    <div
        class="relative flex flex-col gap-5 w-full border-4 p-4"
        :class="[
            {'border-neutral-500': !props.dark},
            {'bg-neutral-950 border-neutral-800': props.dark},
            {'border-transparent': !active},
            {'border-neutral-300 ': active},
        ]"
        @drop.prevent="drop"
        @dragenter.prevent="setActive"
        @dragover.prevent="setActive"
        @dragleave.prevent="setInactive" 
    >
        <GlobalLabel v-if="$slots.label || props.renderLabel"
            :input-uid="inputUid"
            :label-styles="props.labelStyles"
            :optional="props.optional"
            :has-value="Boolean(files)"
            :has-default-value="false"
            :validation-state="validationState"
            :dark="props.dark"
            @clear="clear"
        >
            <template v-if="$slots.label" #label>
                <slot name="label" />
            </template>
            <template v-if="$slots.tooltipHeader" #tooltipHeader>
                <slot name="tooltipHeader" />
            </template>
            <template v-if="$slots.tooltip"  #tooltip>
                <slot name="tooltip" />
            </template>
        </GlobalLabel>

        <div class="flex items-start justify-between whitespace-nowrap gap-16">

            <!-- Number & Size of selected files -->
            <span class="flex flex-col gap-2">
                <span
                    class=" flex flex-col sm:gap-2 sm:flex-row italic text-sm"
                    :class="[
                        {'text-neutral-700': !props.dark},
                        {'text-neutral-400': props.dark}
                    ]"
                >
                    <span>Selected:</span>
                    <span><b>{{ `${files.length} ${files.length === 1 ? 'file' : 'files'}` }}, {{ totalSize }}</b></span>
                    
                </span>
                <span v-if="files.length > 0 && props.multiple" class="hover:cursor-pointer max-w-min italic font-bold text-sm px-3 py-1 text-neutral-700 bg-neutral-200" @click="clear()">Remove All</span>
            </span>

            <div class="flex items-center justify-center gap-5">
                <div class="flex items-center flex-col gap-1">
                    <div class="flex gap-3 items-center justify-center">
                        <MutedButton
                            type="button"
                            @click="showUpload"
                            :dark="props.dark"
                        >
                            <span class="flex gap-2 items-center">
                                <span>Select {{ props.multiple ? 'Files' : 'File' }}</span>
                                <FasFile class="fill-neutral-500 w-[13px]" />
                            </span>
                        </MutedButton>

                        <MutedButton v-if="props.directUpload"
                            type="button"
                            class="bg-neutral-200 text-neutral-700"
                            :class="{'disabled': validationState.errors.length > 0 }"
                            @click="uploadClicked"
                        >
                            Upload
                        </MutedButton>

                    </div>                    
                    <span
                        class="text-sm"
                        :class="[
                            props.dark ? 'text-neutral-300' : 'text-neutral-700'
                        ]"
                    >
                        Max upload size: {{ formatBytes(props.maxBytes) }}
                    </span>
                </div>

                <VR :dark="props.dark" />

                <div class="flex flex-col items-center justify-center gap-5">
                    <FasFileImport class="fill-neutral-500 w-[25px]" />
                    <span class="text-neutral-500">
                        Or drag it here
                    </span>
                </div>

            </div>
        </div>
        <input
            type="file"
            :id="id"
            :name="name"
            :tabindex="props.tabindex ?? 1"
            :accept="accept"
            :multiple="props.multiple"
            class="hidden"
            ref="input"
            @change="filesSelected"
        />
        
        <List v-if="files.length > 0" class="shadow-inner">
            <ListItem v-for="file in files" class="flex flex-col gap-3">
                <span class="flex justify-between items-center gap-6 w-full">
                    <span class="flex flex-col sm:flex-row gap-0 sm:gap-3">
                        <span class="flex gap-3">
                            <span>
                                <template v-if="images.includes(file.name.split('.').pop() ?? 'unknown') && file.size < 15000000">
                                    <Suspense>
                                        <template #default>
                                            <Image class="!w-[25px] !h-[25px]" :preview="file" show-tooltip/>
                                        </template>
                                        <template #fallback>
                                            <FileIcon :file-type="file.name.split('.').pop() ?? 'unknown'" />
                                        </template>
                                    </Suspense>
                                </template>
                                <FileIcon :file-type="file.name.split('.').pop() ?? 'unknown'" />
                            </span>
                            <span class="ellipse max-w-[200px] sm:max-w-[250px]">{{ file.name }}</span>
                        </span>
                        <span class="flex gap-3">
                            <span class="italic text-neutral-500 whitespace-nowrap">{{ formatBytes(file.size) }} - {{ file.size }}</span>
                        </span>
                    </span>
                    <span class="hover:cursor-pointer italic font-bold text-sm text-cyan-500 hover:underline" @click="removeFile(file)">Remove</span>
                </span>
                <span v-if="!fileSizePasses(file.size)" class="text-red-500 italic">File is too large</span>
            </ListItem>
        </List>

        <TransitionFade>
            <div v-if="active"
                class="absolute w-full h-full left-0 top-0 flex items-center justify-center bg-white backdrop-blur-[3px]"
                :class="[
                    {'bg-opacity-50': !props.dark},
                    {'bg-opacity-20': props.dark}
                ]"
            >
                <div class="flex items-center justify-center gap-3">
                    <span
                        class="text-xl px-5 py-2 rounded-full"
                        :class="[
                            {'text-neutral-700 bg-white': !props.dark},
                            {'text-neutral-300 bg-black': props.dark}
                        ]"
                    >
                        Drop
                    </span>
                </div>
            </div>
        </TransitionFade>
        
    </div>
</template>