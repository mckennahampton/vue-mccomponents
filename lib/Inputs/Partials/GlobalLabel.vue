<script setup lang="ts">
import { computed, ref } from 'vue'
import Validations from './Validations.vue'
import LabelTooltip from './LabelTooltip.vue'
import { useElementSize } from '@vueuse/core'
import { type ValidationState } from './InputProps'

const props = withDefaults(defineProps<{
    labelStyles?: any,
    iconClass?: string,
    iconStyles?: string,
    dark?: boolean,
    inputUid: string,
    optional?: boolean,
    hasDefaultValue: boolean,
    valueIsDefaulted?: boolean,
    hasValue?: boolean,
    validationState?: ValidationState,
    resetable?: boolean,
}>(), {
    showValidated: false,
    format: 'string',
    focus: false,
    ignoreValidation: false,
    renderLabel: true,
    dark: false,
    optional: false,
    valueIsDefaulted: true,
    validating: false,
    resetable: true,
})

const emit = defineEmits([
    'reset',
    'clear'
])

const labelRef = ref<HTMLElement | null>(null)
const { width: labelWidth } = useElementSize(labelRef)

const textRef = ref<HTMLElement | null>(null)
const { width: textWidth } = useElementSize(textRef)

const labelWidthDifference = computed(() => labelWidth.value - textWidth.value)

defineExpose({
    labelWidth,
    textWidth,
    labelWidthDifference
})

</script>
<template>
    <label
        class="text-[13px] hover:cursor-text font-bold transform transition-all z-[2]"
        :class="[
            {'text-black': !props.dark},
            {'text-white': props.dark},
            props.labelStyles
        ]"
        :for="props.inputUid"
        
    >
        <div class="w-full min-w-min flex items-center justify-between gap-1" ref="labelRef">
            
            <!-- Label, tooltip & validations -->
            <div class="flex items-center gap-2">

                <!-- Tooltip -->
                <LabelTooltip v-if="$slots.tooltip" :dark="props.dark" class="!hover:cursor-default">
                    <template v-if="$slots.tooltipHeader" #tooltipHeader>
                        <slot name="tooltipHeader" />
                    </template>
                    <template v-if="$slots.tooltip" #tooltip>
                        <slot  name="tooltip" />
                    </template>
                </LabelTooltip>
                {{  }}
                <!-- Label -->
                <!-- Has [data-label-content] as CSS selector hook -->
                <!-- Has transparent border to exactly match height with the Clear & Reset buttons -->
                <span
                    data-label-content
                    class="border border-transparent whitespace-nowrap"
                    :class="[
                        {'invisible':  !$slots.label},
                    ]"
                    ref="textRef"
                >
                    <slot v-if="$slots.label" name="label" />
                    <template v-else>invisible</template>
                </span>
                
                <!-- Validations -->
                <Validations v-if="props.validationState"
                    :validation-state="props.validationState"
                />

            </div>


            <!-- Clear & Reset -->
            <div v-if="(props.optional && props.hasValue) || (props.hasDefaultValue && props.resetable)"
                class="w-[110px] opacity-0 group-hover:opacity-100 z-0 group-hover:z-[1] transition-all flex items-center justify-end text-blue-500 italic"
                @click.stop.prevent
            >
                <!-- Clear -->
                <div v-if="props.optional && props.hasValue"
                    @click.stop.prevent="props.hasValue && emit('clear')"
                    tabindex="-1"
                    class="flex items-center justify-center rounded-full px-2 border border-transparent hover:border-blue-500 hover:cursor-pointer transition"
                >
                    Clear
                </div>

                <!-- Reset -->
                <div v-if="props.hasDefaultValue && props.resetable && !props.valueIsDefaulted"
                    @click.stop.prevent="!props.valueIsDefaulted && emit('reset')"
                    tabindex="-1"
                    class="flex items-center justify-center rounded-full px-2 border border-transparent hover:border-blue-500 hover:cursor-pointer transition"
                >
                        Reset
                </div>

            </div>

        </div>
    </label>
</template>