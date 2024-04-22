<script setup lang="ts">
import uid from '../Utilities/uid'
import { ref, watch, watchEffect  } from 'vue'
import GlobalLabel from './Partials/GlobalLabel.vue'
import { type ValidationState } from './Partials/InputProps'

const props = withDefaults(defineProps<{
    modelValue: string | null,
    labelStyles?: any,
    showValidated?: boolean,
    scroll?: boolean,
    dark?: boolean,

    renderLabel?: boolean,
    validationState?: ValidationState,
    optional?: boolean,
}>(), {
    showValidated: false,
    scroll: false,
    renderLabel: false,
    optional: false,
    dark: false,
})

const emit = defineEmits(['update:modelValue', 'focused', 'unfocused'])

const inputUid = uid()
const textarea = ref<HTMLElement | null>(null)
const textAreaModel = ref<string | null>(props.modelValue)
const textAreaModelDefaultValue = ref<string | null>(props.modelValue)
watch(() => props.modelValue, () => textAreaModel.value = props.modelValue)
watch(textAreaModel, () => emit('update:modelValue', textAreaModel.value))
const reset = () => {
    if (textAreaModelDefaultValue.value) textAreaModel.value = textAreaModelDefaultValue.value
    emit('update:modelValue', textAreaModel.value)
}

const clear = () => {
    textAreaModel.value = null
    emit('update:modelValue', textAreaModel.value)
}

const resizeTextArea = () => {
    if (textarea.value)
    {
        textarea.value.style.height = 'auto'
        textarea.value.style.height = (textarea.value.scrollHeight) + 'px'
    }
}

watchEffect(onInvalidate => {
    if (!textarea.value) return
    
    resizeTextArea()
    textarea.value.addEventListener('input', resizeTextArea)
    onInvalidate(() => {
        if (textarea.value) textarea.value.removeEventListener('input', resizeTextArea)
    })
})

</script>

<template>
    <div class="flex flex-col group">
        <GlobalLabel v-if="$slots.label || props.renderLabel"
            :input-uid="inputUid"
            :label-styles="props.labelStyles"
            :optional="props.optional"
            :has-value="Boolean(textAreaModel)"
            :has-default-value="Boolean(textAreaModelDefaultValue)"
            :value-is-defaulted="textAreaModel === textAreaModelDefaultValue"
            :validation-state="props.validationState"
            @reset="reset"
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

        <div
            :class="[
                {'scroll-y h-full max-h-[200px] resize-none': props.scroll},
                {'overflow-y-hidden': !props.scroll}
            ]"
        >
            <textarea
                v-bind="$attrs"
                v-model="textAreaModel"
                :id="inputUid"
                :class="[
                    {'empty': !Boolean(textAreaModel)},
                    {'not-empty': Boolean(textAreaModel)},
                    {'resize-none': props.scroll},
                ]"
                ref="textarea"
                palceholder=""
                rows="1"
            />
        </div>
    </div>
</template>
<style scoped>
textarea {
    @apply
    w-full border-b-2  bg-transparent px-3 py-2.5 text-sm font-normal
    text-black outline outline-0 transition placeholder-shown:border placeholder-shown:border-gray-200 placeholder-shown:border-t-gray-200
    disabled:resize-none disabled:border-0 disabled:bg-gray-50
}

textarea.required-placeholder
{
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='20px' width='150px'><text x='0' y='15' fill='red' font-size='15' font-family='Helvetica, Arial, sans-serif' font-style='italic'>* Required</text></svg>");
    background-repeat: no-repeat;
    background-position: left;
}


/* Floating label styles */
label:has(~ textarea:focus),
label:has(~ textarea:placeholder-shown),
label:has(~ textarea.not-empty),
label:has(~ textarea.required-placeholder)
{
    @apply px-2 top-2 -translate-y-7 text-black
}
</style>