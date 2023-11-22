<script setup lang="ts">

const props = withDefaults(defineProps<{
    mode?: 'default' | 'out-in' | 'in-out'
}>(), {
    mode: 'default'
})

</script>
<template>

    <Transition :mode="props.mode" name="fade">
        <slot/>
    </Transition>

</template>
<style>
.fade-enter-active,
.fade-enter
{
    transition: opacity 200ms ease;
}

.fade-leave-active
{
    transition: opacity 200ms ease;
}

.fade-leave-to,
.fade-enter-from
{
    opacity: 0;
}
</style>