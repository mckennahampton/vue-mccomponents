<script setup lang="ts">
import { ref, watch } from 'vue'
import uid from '../Utilities/uid'
import GlobalLabel from './Partials/GlobalLabel.vue'
import { type ValidationState } from './Partials/InputProps'

interface Props {
    modelValue: boolean | null,
    name?: string,
    labelStyles?: any,
    dark?: boolean,
    validationState?: ValidationState,
    renderLabel?: boolean,
}
const props = withDefaults(defineProps<Props>(), {
    showValidated: false,
    dark: false,
    required: false,
    renderLabel: true,
})
const emit = defineEmits(['update:modelValue'])

const inputUid = uid()

const checked = ref(props.modelValue)
const defaultValue = ref(props.modelValue !== null ? props.modelValue : null)
watch(checked, () => emit('update:modelValue', checked.value))

const reset = () => {
    if (defaultValue.value !== null) checked.value = defaultValue.value
    emit('update:modelValue', checked.value)
}

</script>
<template>
    <div class="flex items-center justify-start gap-4">
        <span class="flex items-center justify-center gap-2">
            <input
                type="checkbox"
                v-model="checked"
                :id="inputUid"
                class="cursor-pointer w-4 h-4 bg-gray-100 border-gray-300"
                :name="props.name"
            />
            <GlobalLabel v-if="$slots.label || renderLabel"
                :validation-state="props.validationState"
                :input-uid="inputUid"
                :label-styles="[
                    props.labelStyles,
                    'text-base font-normal !hover:cursor-pointer [&_[data-label-content]]:hover:cursor-pointer'
                ]"
                :has-default-value="defaultValue !== null"
                :value-is-defaulted="checked === defaultValue"
                :dark="props.dark"
                @reset="reset"
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
        </span>
    </div>
</template>