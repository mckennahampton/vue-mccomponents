<script setup lang="ts">
import Tooltip from '../../Tooltip.vue'
import FasXMark from '../../Icons/FasXMark.vue'
import Spinner from '../../Spinners/Spinner.vue'
import { type ValidationState } from './InputProps'
import FasFaCheck from '../../Icons/FasFaCheck.vue'
import FasCircleExclamation from '../../Icons/FasCircleExclamation.vue'

const props = defineProps<{
    validationState: ValidationState,
}>()

</script>
<template>
    <Tooltip
        class="flex items-center justify-center gap-1 rounded-full h-[22px] text-white hover:cursor-default"
        :class="[
            {'border border-red-500 px-[6px]': !props.validationState.isValidating && props.validationState.errors.length > 0},
            {'w-[22px]': props.validationState.errors.length == 0}
        ]"
    >
        <template #tooltip>
            <div v-if="props.validationState.errors.length > 0" class="flex flex-col items-start gap-5">
                <div class="flex flex-col items-start">
                    <div v-for="error in props.validationState.errors"
                        class="flex items-center gap-3" 
                    >
                        <FasXMark class="fill-red-500 w-[12px] h-[12px]" />
                        <span>{{ error }}</span>
                    </div>
                </div>
            </div>
            <span v-else>
                Field is valid
            </span>
        </template>

        <!-- Actively validating -->
        <Spinner v-if="props.validationState.isValidating" stubby class="w-[14px] h-[14px] animate-spin-fast" />

        <!-- Has errors -->
        <template v-else-if="props.validationState.errors.length > 0">
            <FasCircleExclamation class="fill-red-500 w-[12px] h-[12px]" />
            <span class="text-red-500">{{ props.validationState.errors.length }}</span>
        </template>

        <!-- Validated -->
        <FasFaCheck v-else
            class="w-[12px] h-[12px] fill-green-500 text-xs transition-all opacity-100"
        />

    </Tooltip>

</template>