<script setup lang="ts">
import VR from '../Layout/VR.vue'
import uid from '../Utilities/uid'
import Image from '../Displays/Image.vue'
import List from '../Collections/List.vue'
import FileIcon from '../Icons/FileIcon.vue'
import { useVuelidate } from '@vuelidate/core'
import ListItem from '../Collections/ListItem.vue'
import { ValidateEach } from '@vuelidate/components'
import { watch, computed, reactive, ref } from 'vue'
import MutedButton from '../Buttons/MutedButton.vue'
import FasFileImport from '../Icons/FasFileImport.vue'
import { formatBytes } from '../Utilities/numberHelpers'
import { helpers, maxValue } from '@vuelidate/validators'
import { words, images, excels, powerpoints } from '../Inputs/fileTypes'

interface Props {
    multiple?: boolean,
    name?: string,
    tabindex?: number,
    type?: 'image' | 'excel' | 'word' | 'document' | 'video',
    extensions?: string[] | string,
    modelValue: any[],
    directUpload?: boolean,
    maxBytes?: number,
    dark?: boolean,
    emptyPlaceholder?: string,
    label?: string,
}
const props = withDefaults(defineProps<Props>(), {
    multiple: false,
    name: 'file',
    tabindex: 1,
    directUpload: false,
    maxBytes: 15728640,
    dark: false,
})
const emit = defineEmits(['update:modelValue', 'upload'])

const totalSize = computed(() => {
    let bytes = 0;
    state.files.forEach(file => bytes += file.size)
    return formatBytes(bytes)
})

const totalBytes = () => {
    let bytes = 0;
    state.files.forEach(file => bytes += file.size)
    return bytes
}

//#region Validation
const state = reactive({
    files: props.modelValue,
})

const aggregateSize = reactive({
    totalBytes: 0
})

const fileRules = computed(() => ({
    size: {
        maxValue: helpers.withMessage('File is too large', maxValue(props.maxBytes))
    }
}))

const aggregateRules = computed(() => ({
    totalBytes: {
        maxValue: helpers.withMessage('Upload size is too large', maxValue(props.maxBytes))
    }
}))

const v$ = useVuelidate()
const aggregate_size_v$ = useVuelidate(aggregateRules, aggregateSize)

//#endregion
const input = ref<HTMLInputElement | null>(null)


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

    if (!props.multiple) state.files.length = 0

    if (input.value?.files)
    {
        for (const file of Object.values(input.value?.files)) {
            if (!state.files.some(_file => _file.name == file.name)) state.files.push(file)
        }
    }

    if (input.value) input.value.value = '' // Reset the DOM input to allow for us to dynamically handle the file list
    aggregateSize.totalBytes = totalBytes()
}

const removeFile = (file: File) => {

    let index = state.files.indexOf(file)
    if (index > -1) { // only splice array when item is found
        state.files.splice(index, 1) // 2nd parameter means remove one item only
    }
    aggregateSize.totalBytes = totalBytes()
}

const clear = () => {
    if (input.value) input.value.value = ''
    state.files.length = 0
}

watch(state, () => emit('update:modelValue', state.files))

const uploadClicked = () => {
    if (aggregate_size_v$.value.$invalid || v$.value.$invalid || state.files.length == 0) {
        return
    }
    else {
        emit('upload')
    }
}

//#region Drag & Drop
    const active = ref(false)
    let inActiveTimeout = ref({} as NodeJS.Timeout)
    const setActive = () => {
        active.value = true
        clearTimeout(inActiveTimeout.value)
    }
    const setInactive = () => {
        inActiveTimeout.value = setTimeout(() => {
            active.value = false
        }, 50)
    }
    const drop = (e: DragEvent) => {
        setInactive()

        if (!props.multiple) state.files.length = 0
        if (!e?.dataTransfer?.files) return

        for (let i = 0; i < e.dataTransfer.files.length ?? 0; i++)
        {
            let file = e.dataTransfer.files.item(i)
            if (!state.files.some(_file => _file.name == file?.name)) state.files.push(file)
            if (!props.multiple) break
        }


        if (input.value) input.value.value = '' // Reset the DOM input to allow for us to dynamically handle the file list
        aggregateSize.totalBytes = totalBytes()
    }
//#endregion
</script>
<template>
    <div
        class="relative flex flex-col gap-5 w-full max-w-[500px] border-2 border-neutral-500 p-4"
        :class="[
            props.dark ? 'bg-neutral-900' : ''
        ]"
        @drop.prevent="drop"
        @dragenter.prevent="setActive"
        @dragover.prevent="setActive"
        @dragleave.prevent="setInactive" 
    >
        <label v-if="props.label" class="font-bold text-[13px]" >
            {{ props.label }}
        </label>
        <div class="flex items-center justify-between whitespace-nowrap">
            <span class="flex flex-col gap-2">
                <span
                    class=" flex flex-col sm:gap-2 sm:flex-row italic text-sm"
                    :class="[
                        props.dark ? 'text-neutral-300' : 'text-neutral-700'
                    ]"
                >
                    <span>Selected:</span>
                    <span><b>{{ `${state.files.length} ${state.files.length === 1 ? 'file' : 'files'}` }}, {{ totalSize }}</b></span>
                </span>
                <span v-if="state.files.length > 0" class="hover:cursor-pointer max-w-min italic font-bold text-sm text-cyan-500 hover:underline" @click="clear()">Remove All</span>
                <span v-if="aggregate_size_v$.totalBytes.$silentErrors.length > 0" class="text-red-500 italic">{{ aggregate_size_v$.totalBytes.$silentErrors[0].$message }}</span>
            </span>
            <div class="flex items-center justify-center gap-5">
                <div class="flex items-center flex-col gap-1">
                    <div class="flex gap-3 items-center justify-center">
                        <MutedButton type="button" @click="showUpload" class="bg-neutral-200 text-neutral-700">
                            <span class="flex gap-2 items-center">
                                <span>Select {{ props.multiple ? 'Files' : 'File' }}</span>
                                <Icon :iconClass="'fas fa-file-alt'" />
                            </span>
                        </MutedButton>
                        <MutedButton v-if="props.directUpload"
                            type="button"
                            class="bg-neutral-200 text-neutral-700"
                            :class="{'disabled': aggregate_size_v$.$invalid || v$.$invalid || state.files.length == 0 }"
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

                <VR />

                <div class="flex flex-col items-center justify-center gap-5">
                    <FasFileImport class="fill-neutral-500" />
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
        
        <List v-if="state.files.length > 0">
            <ValidateEach v-for="file in state.files" :key="file" :state="file" :rules="fileRules">
                <template #default="{v}">
                    <ListItem class="flex flex-col gap-3">
                        <span class="flex justify-between items-center gap-6 w-full">
                            <span class="flex flex-col sm:flex-row gap-0 sm:gap-3">
                                <span class="flex gap-3">
                                    <span>
                                        <template v-if="images.includes(file.name.split('.').pop()) && file.size < 15000000">
                                            <Suspense>
                                                <template #default>
                                                    <Image class="!w-[25px] !h-[25px]" :preview="file" show-tooltip/>
                                                </template>
                                                <template #fallback>
                                                    <FileIcon :file-type="file.name.split('.').pop()" />
                                                </template>
                                            </Suspense>
                                        </template>
                                        <FileIcon :file-type="file.name.split('.').pop()" />
                                    </span>
                                    <span class="ellipse max-w-[200px] sm:max-w-[250px]">{{ file.name }}</span>
                                </span>
                                <span class="flex gap-3">
                                    <span class="italic text-neutral-500 whitespace-nowrap">{{ formatBytes(file.size) }} - {{ file.size }}</span>
                                </span>
                            </span>
                            <span class="hover:cursor-pointer italic font-bold text-sm text-cyan-500 hover:underline" @click="removeFile(file)">Remove</span>
                        </span>
                        <span v-if="v.size.$silentErrors.length > 0" class="text-red-500 italic">{{ v.size.$silentErrors[0].$message }}</span>
                    </ListItem>
                </template>
            </ValidateEach>
        </List>

        <div v-if="active"
            class="absolute w-full h-full left-0 top-0 flex items-center justify-center bg-white bg-opacity-50"
        >
            <div class="flex items-center justify-center gap-3">
                <span class="text-neutral-700 text-xl">
                    Drop
                </span>
            </div>
        </div>
    </div>
</template>