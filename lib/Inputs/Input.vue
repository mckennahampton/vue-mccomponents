<script setup lang="ts">
import uid from '../Utilities/uid'
import Tooltip from '../Tooltip.vue'
import { ref, watch, computed } from 'vue'
import FasCircleQuestion from '../Icons/FasCircleQuestion.vue'

const props = withDefaults(defineProps<{
    inputInitialValue?: string | number,
    modelValue?: string | number | object,
    label?: string,
    showValidated?: boolean,
    labelStyles?: any,
    emptyPlaceholder?: string,
    format?: 'string' | 'number',
    focus?: boolean,
    ignoreValidation?: boolean,
    renderLabel?: boolean,
    dark?: boolean,
}>(), {
    showValidated: false,
    format: 'string',
    focus: false,
    ignoreValidation: false,
    renderLabel: true,
    dark: false
})

const validNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const validSpecialKeys = ['Backspace', 'Tab', 'Shift', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Control', 'Alt']

const emit = defineEmits(["update:modelValue"]);

const input = ref(null)
const inputValue = ref(props.modelValue ?? null)
const inputUid = uid()

const validate = (e: KeyboardEvent) => {
    if (props.format == 'number' && !validNumbers.includes(e.key) && !validSpecialKeys.includes(e.key)) e.preventDefault()
}

const emptyClass = computed(() => inputValue.value ? 'not-empty' : 'empty')

watch(inputValue, () => emit('update:modelValue', inputValue.value))

watch(props, () => {
    if(props.modelValue) inputValue.value = props.modelValue
    else inputValue.value = null
})

defineExpose({
    input
})

</script>
<template>
    <div class="flex flex-col">
        <label v-if="renderLabel"
            class="text-[13px] hover:cursor-text text-black font-bold delay-0 transform transition-all"
            :class="[
                {'invisible':  !props.label},
                props.labelStyles
            ]"
            :for="inputUid"
        >
            {{ props.label ?? 'invisible' }}

            <Tooltip v-if="$slots.tooltip">
                <template #tooltip>
                    <slot v-if="$slots.tooltip" name="tooltip" />
                </template>
                <FasCircleQuestion />
            </Tooltip>
            
        </label>
    </div>
\
    <input
        v-bind="$attrs"
        @keydown="e => validate(e)"
        style="box-shadow: none;"
        class="w-full h-10 border-b-2 bg-transparent focus:border-red-500"
        :class="[
            emptyClass,
            props.dark ? 'text-white !border-b-neutral-700' : 'text-black !border-b-neutral-400'
        ]"
        v-model="inputValue"
        :id="inputUid"
        ref="input"
    />
</template>
<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Read-only */ input[readonly] { @apply pointer-events-none text-center !text-black }


/* Floating label styles */
label:has(~ input:focus),
label:has(~ input:placeholder-shown),
label:has(~ input.not-empty)
{
    @apply transform -translate-y-10 text-black left-0 delay-0 
}

</style>