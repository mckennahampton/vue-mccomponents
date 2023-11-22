<script setup lang="ts">
import { computed } from 'vue'

interface Props {
    iconClass?: string,
    iconStyle?: string | string[],
    showTooltip?: boolean,
    showValidated?: boolean,
}

const props = withDefaults(defineProps<Props>(), {
    showTooltip: false,
    showValidated: false,
})

</script>
<template>
    <div class="flex gap-3 items-center inputGroup">
        <div class="relative w-full min-w-min whitespace-nowrap">
            <slot name="label" />
            <slot name="input" class="peer"/>
        </div>
    </div>
</template>
<style>

.inputGroup:has(input:focus) .icon,
.inputGroup:has(textarea:focus) .icon
{
    @apply text-locke-red-500
}

.inputGroup:has(input) label,
.inputGroup:has(textarea) label
{
    @apply hover:cursor-text
}

.inputGroup label:not([checkbox-label]) {
    @apply font-bold z-[2]
}


/* ///////////////////////////////////////////////////////////////////////////////////////// */
/*#region Filepicker label styles*/


/*#endregion*/
/* ///////////////////////////////////////////////////////////////////////////////////////// */


/* ///////////////////////////////////////////////////////////////////////////////////////// */
/*#region <input> + <label> styles*/

.inputGroup input:not([type=file]):not([type=checkbox])
{
    @apply
    w-full h-10 text-gray-900 border-b-2 border-neutral-400 focus:outline-none focus:border-locke-red-500
}

.inputGroup:not(:has(.dp__input)):has(input:not([type=file]):not([type=checkbox])) label, /* <-- :not(:has(.dp__input)) Bypass the datepicker */
.inputGroup:has(code) label,
.inputGroup:has(input[type=checkbox]) label:not([checkbox-label]),
.inputGroup:not(:has(.dp__input)):has(span):not(:has(div[checkboxes])) label /* <-- :not(:has(.dp__input)) Bypass the datepicker */
{
    @apply
    absolute left-0 top-[50%] text-gray-600 text-sm transition-all delay-100 transform -translate-y-[50%]
}

.inputGroup:not(:has(.dp__input)):has(input:not([type=file]):not([type=checkbox]):focus) label, /* <-- :not(:has(.dp__input)) Bypass the datepicker  */
.inputGroup input:not([type=file]):not([type=checkbox]):placeholder-shown ~ label,
.inputGroup:has(input:not([type=file]):not([type=checkbox]).not-empty) label,
.inputGroup:has(code) label,
.inputGroup:has(input[type=checkbox]) label:not([checkbox-label]),
.inputGroup:not(:has(.dp__input)):has(span):not(:has(div[checkboxes])) label /* <-- :not(:has(.dp__input)) Bypass the datepicker */
{
    @apply transform -translate-y-10 -translate-x-1 text-black left-0 delay-0
}

.inputGroup:has(.icon) input:not([type=file]):not([type=checkbox]):focus ~ label,
.inputGroup:has(.icon) input:not([type=file]):not([type=checkbox]):placeholder-shown ~ label,
.inputGroup:has(input:not([type=file]):not([type=checkbox]).not-empty):has(.icon) label
{
    @apply -translate-x-3
}

.inputGroup input[readonly] {
    @apply pointer-events-none text-center !text-black
}

.inputGroup.validating.noErrors input[type=text] {
    @apply border-b-green-500
}
.inputGroup.validating.noErrors:has(input[type=text]) label {
    @apply text-green-600
}
.inputGroup.validating.noErrors:has(input[type=text]) .icon {
    @apply text-green-600
}

/*#endregion*/
/* ///////////////////////////////////////////////////////////////////////////////////////// */

/* ///////////////////////////////////////////////////////////////////////////////////////// */
/*#region <textarea> + <label> styles*/
.inputGroup textarea {
    @apply
    w-full border-b-2 border-neutral-500 bg-transparent px-3 py-2.5 text-sm font-normal overflow-y-hidden
    text-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-gray-200 placeholder-shown:border-t-gray-200
    disabled:resize-none disabled:border-0 disabled:bg-gray-50
}

.inputGroup.hasErrors textarea {
    @apply
    border-red-500
}

.inputGroup:has(textarea) label {
    @apply
    absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-100 top-5 z-10 origin-[0]
    bg-white  px-2 left-1
}

.inputGroup:has(textarea:focus) label,
.inputGroup:has(textarea:placeholder-shown) label,
.inputGroup:has(textarea.not-empty) label {
    @apply
    px-2 top-2 scale-75 -translate-y-4
}

/*#endregion*/
/* ///////////////////////////////////////////////////////////////////////////////////////// */

/* ///////////////////////////////////////////////////////////////////////////////////////// */
/*#region <select> + <label> styles*/
.inputGroup select:focus ~ label,
.inputGroup select:not([value=""]):valid ~ label {
  @apply transform;
  /* @apply scale-75; */
  @apply -translate-y-6;
  @apply -translate-x-2
}

/*#endregion*/
/* ///////////////////////////////////////////////////////////////////////////////////////// */

/* ///////////////////////////////////////////////////////////////////////////////////////// */
/*#region <input> (switch) + <label> styles */
.inputGroup:has(.switch) label {
    @apply
    absolute left-0 !-top-7 text-base duration-300 scale-100 z-10 origin-[0] !transform-none
}
/*#endregion*/
/* ///////////////////////////////////////////////////////////////////////////////////////// */

/* ///////////////////////////////////////////////////////////////////////////////////////// */
/*#region <select> + <label> styles*/
.inputGroup:has(.select-input) label,
.inputGroup:has(select) label
{
    @apply absolute text-sm  top-0 origin-[0] px-2 left-1 -translate-y-6 -translate-x-2
}

/*#endregion*/
/* ///////////////////////////////////////////////////////////////////////////////////////// */

/* ///////////////////////////////////////////////////////////////////////////////////////// */
/*#region <select> + <label> styles*/
/* .inputGroup:has(code) label
{
    @apply absolute text-sm top-0 origin-[0] left-0 -translate-y-6 
} */

/*#endregion*/
/* ///////////////////////////////////////////////////////////////////////////////////////// */

/* ///////////////////////////////////////////////////////////////////////////////////////// */
/*#region DatePicker + label */

.inputGroup:has(.dp__input_wrap) {
    @apply pt-3
}

.inputGroup:has(.dp__input_wrap) label {
    @apply
    absolute left-0 -top-5 text-sm transition-all transform -translate-x-1 text-neutral-700 delay-0
}

/*#endregion*/
/* ///////////////////////////////////////////////////////////////////////////////////////// */

</style>