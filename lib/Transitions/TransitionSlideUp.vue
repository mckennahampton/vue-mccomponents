<template>

    <Transition name="slideUp">
        <slot/>
    </Transition>

</template>
<style>
    .slideUp-enter-active,
    .slideUp-leave-active {
        transition: transform 100ms ease-in-out;
    }

    .slideUp-enter-from,
    .slideUp-leave-to {
        transform: translate(-50%, 100%);
    }
</style>