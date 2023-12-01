<template>
    <div class="flex gap-3 items-center inputGroup">
        <div class="relative w-full min-w-min whitespace-nowrap">
            <slot />
        </div>
    </div>
</template>
<style>

.inputGroup:has(input:focus) .icon,
.inputGroup:has(textarea:focus) .icon
{
    @apply text-red-500
}

.inputGroup label:not([checkbox-label]) {
    @apply font-bold z-[2]
}


/* ///////////////////////////////////////////////////////////////////////////////////////// */
/*#region <input> + <label> styles*/

/* .inputGroup:has(code) label
{
    @apply
    absolute left-0 top-[50%] text-sm transition-all transform
    -translate-y-10 -translate-x-1 text-black delay-0
}

.inputGroup:has(.icon) input:not([type=file]):not([type=checkbox]):focus ~ label,
.inputGroup:has(.icon) input:not([type=file]):not([type=checkbox]):placeholder-shown ~ label
{
    @apply -translate-x-3
}

.inputGroup input[readonly] {
    @apply pointer-events-none text-center !text-black
} */

.inputGroup.validating.noErrors input[data-searcher] {
    @apply border-b-green-500
}
.inputGroup.validating.noErrors:has(input[data-searcher]) label {
    @apply text-green-600
}
.inputGroup.validating.noErrors:has(input[data-searcher]) .icon {
    @apply text-green-600
}

/*#endregion*/
/* ///////////////////////////////////////////////////////////////////////////////////////// */




/* ///////////////////////////////////////////////////////////////////////////////////////// */
/*#region DatePicker + label */

.inputGroup:has(.dp__input_wrap) {
    @apply pt-3
}

/*#endregion*/
/* ///////////////////////////////////////////////////////////////////////////////////////// */

/* ///////////////////////////////////////////////////////////////////////////////////////// */
/*#region Validation Error */

.validationError {
    @apply
    absolute w-min max-w-[500px] left-[50%] bottom-full transform -translate-x-[50%]
    flex gap-3 items-center p-2
    text-center bg-white whitespace-nowrap
    border-2 border-red-600 rounded-md
}

.arrow {
    @apply
    absolute top-full left-[50%] transform -translate-x-[50%]
    border-solid border-t-red-600 border-t-8 border-x-transparent border-x-8 border-b-0
}

.inputGroup:not(:has(textarea:focus)) .validationError,
.inputGroup:not(:has(input:focus)) .validationError,
.inputGroup:not(:has(select:focus)) .validationError
{
    @apply
    opacity-0 -z-0 transition-all
}

.inputGroup:has(textarea:focus) .validationError,
.inputGroup:has(input:focus) .validationError,
.inputGroup:has(select:focus) .validationError,
.inputGroup:has([data-dropdown-button]) .validationError
{
    @apply
    opacity-100 z-[1]
}

.inputGroup:has(input) .validationError {
    @apply -translate-y-[20px]
}

.inputGroup:has(textarea) .validationError {
    @apply -translate-y-[10px]
}

.inputGroupnot:not(:has([data-searcher])) .inline-validation-error {
    @apply left-0
}

.inputGroup:has([data-searcher]) .inline-validation-error {
    @apply left-7
}

.inputGroup:has(input[type=file]) .inline-validation-error {
    @apply -top-3 right-auto left-auto
}

/*#endregion*/

</style>