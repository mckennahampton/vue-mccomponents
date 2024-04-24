<script setup lang="ts">

const props = withDefaults(defineProps<{
    loading?: boolean,
}>(), {
    loading: true
})

</script>
<template>
    <div class="relative h-[2px] block w-full overflow-hidden">
        <div :class="[{'indicator': props.loading}]"></div>
    </div>
</template>
<style scoped>

.indicator:before {
  content: '';  
  /* width: 10px;
  height: 4.8px; */
  height: 2px;
  background: #000;
  position: absolute;
  opacity: 0.3;
  top: 0;
  left: 0;
  box-sizing: border-box;
  will-change: left, right;
  animation: indeterminate 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
}

.indicator:after {
    content: '';
    position: absolute;
    /* width: 10px;
    height: 4.8px; */
    height: 2px;
    opacity: 0.3;
    background-color: black;
    top: 0;
    left: 0;
    will-change: left, right;
    animation: indeterminate-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;
    animation-delay: 1.15s;
}

@keyframes move {
  0% {
    left: 0;
    transform: translateX(-1%);
  }
  100% {
    left: 100%;
    transform: translateX(-99%);
  }
}

@keyframes indeterminate {
    0% {
        left: -35%;
        right: 100%;
    }

    60% {
        left: 100%;
        right: -90%;
    }
    100% {
        left: 100%;
        right: -90%;
    }
}

@keyframes indeterminate-short {
    0% {
        left: -200%;
        right: 100%;
    }

    60% {
        left: 107%;
        right: -8%;
    }
    100% {
        left: 107%;
        right: -8%;
    }
}
</style>