<script setup lang="ts">
import { computed } from 'vue'
import ButtonIcon from './ButtonIcon.vue'
import HorizontalIndicator from '../Indicators/HorizontalIndicator.vue'

const props = withDefaults(defineProps<{
    iconClass?: string,
    iconStyle?: string,
    iconPlacement?: 'left' | 'right',
    loading?: boolean,
    href?: string,
}>(),
{
    loading: false,
    iconPlacement: 'left',
})

const element = computed(() => {
    return props.href ? 'a' : 'button'
})

</script>
<template>
    <component
        :is="element"
        :href="props.href"
        class="flex items-center gap-3 bg-locke-red-500 hover:cursor-pointer text-white py-2 px-4 whitespace-nowrap"
    >
        <div class="w-full flex" :class="[
            {'flex-col': !Boolean(props.iconClass)},
            {'gap-2 items-center': Boolean(props.iconClass)}
        ]">

            <ButtonIcon v-if="props.iconClass && props.iconPlacement == 'left'"
                :icon-class="props.iconClass"
                :icon-style="props.iconStyle"
                :loading="props.loading"
            />

            <slot />

            <ButtonIcon v-if="props.iconClass && props.iconPlacement == 'right'"
                :icon-class="props.iconClass"
                :icon-style="props.iconStyle"
                :loading="props.loading"
            />

            <HorizontalIndicator :loading="props.loading" v-if="!props.iconClass" />
        </div>
    </component>
</template>