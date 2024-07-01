import axios from 'axios'
import { ref, watch, toValue, computed, type MaybeRef, type ComputedRef, Reactive } from 'vue'

type ForMethod = 'GET' | 'PATCH' | 'POST' | 'PUT' | 'DELETE' | 'all'

export default function <T extends object>(
    {
        url,
        data,
        group,
        skip,
        immediate_validation,
        for_method = 'all',
        headers,
    }:
    {
        url: string,
        data: Reactive<T>,
        group?: (keyof T)[][],
        skip?: (keyof T)[],
        immediate_validation?: (keyof T)[],
        for_method?: MaybeRef<ForMethod> | ComputedRef<ForMethod>,
        headers?: Record<string, string>
    })
{
    const initiated = ref(false)
    const errors = ref<Record<string, string[]> | null>()
    const fieldsUnderValidation = ref<(keyof T)[]>([])
    const validatedFields = ref<Array<keyof T>>()
    const isDirty = ref(true)
    const dirtyFields = ref<(keyof T)[]>([])
    const method = ref(toValue(for_method))

    const clearErrors = () => errors.value = null

    let timeout = ref<ReturnType<typeof setTimeout>>()
    const debounceTime = ref(0)

    const validate = async (field: keyof T) => {
        isDirty.value = true

        //////////////////////////////////////////////////////
        // Add field(s) to dirty fields
        if (group && group.filter(g => g.includes(field)).length > 0)
        {
            group.filter(g => g.includes(field)).forEach(g => {
                g.forEach(f => {
                    !dirtyFields.value?.includes(f as any) && dirtyFields.value?.push(f as any)
                })
            })
        }
        else !dirtyFields.value?.includes(field as any) && dirtyFields.value?.push(field as any)
        ///////////////////////////////////////////////////////

        if (timeout.value) clearTimeout(timeout.value)
        if (immediate_validation && immediate_validation.includes(field))
        {
            debounceTime.value = 0
            initiated.value = false
        }

        timeout.value = setTimeout(async () => {
            const currentTimeout = timeout.value // Store the current timeout ID
            
            if (initiated.value)
            {
                // Add group siblings to active validation
                if (group && group.filter(g => g.includes(field)).length > 0)
                {
                    group.filter(g => g.includes(field)).forEach(g => {
                        g.forEach(f => {
                            !fieldsUnderValidation.value?.includes(f as any) && fieldsUnderValidation.value?.push(f as any)
                        })
                    })
                }
                else
                {
                    !fieldsUnderValidation.value?.includes(field as any) && fieldsUnderValidation.value?.push(field as any)
                }
            }

            axios.post(url, data, {
                headers: {
                    ...headers,
                    'X-Form-Validations-For-Method': method.value,
                    'X-Form-Validations-Just-Checking': true
                }
            })
            .then(res => {
                if (timeout.value === currentTimeout)
                    {
                        clearErrors()
                        isDirty.value = false
                        dirtyFields.value.length = 0
                        errors.value = res.data
                        fieldsUnderValidation.value = []
                        if (!initiated.value)
                        {
                            initiated.value = true
                            debounceTime.value = 500
                        }
                    }
            })
            .catch(err => {
                console.error(err)

                // Check if this timeout is still the current one
                if (timeout.value === currentTimeout) {
                    fieldsUnderValidation.value = []
                }
            })
        }, debounceTime.value)

        return errors
    }

    let unwatch: null | (() => void) = null
    const validationWatch = () => {
        if (unwatch !== null) return

        // https://github.com/vuejs/vue/issues/2164#issuecomment-406223470
        for (let k in data) {
            if (skip && skip.includes(k as keyof T)) continue

            unwatch = watch(
                [
                    () => toValue(data[k]), // Watch for an input change
                    () => toValue(for_method) // Watch for method change
                ],
                async (val, oldVal) => {
                    method.value = toValue(for_method)
                    await validate(k as keyof T)
                }, // Fetch form validtions
                {
                    immediate: true, // Fire on initial load (for initial validation on all fields)
                    deep: true,
                }
            )
        }
    }

    validationWatch() // kickstarter

    const getErrorFieldRootKey = (path: keyof T) => Object.keys(errors.value).find(key => key.startsWith(path.toString()))

    const getErrors = (path: keyof T) => {
        if (!errors.value) return []
        if (!getErrorFieldRootKey(path)) return []
        return errors.value[getErrorFieldRootKey(path)]
    }

    const fieldIsValidating = (path: keyof T) => initiated.value ? fieldsUnderValidation.value.includes(path as any) : true

    const validationState = (path: keyof T) => {
        return {
            errors: getErrors(path),
            isValidating: fieldIsValidating(path),
            hasValidation: validatedFields.value?.includes(path) ?? false,
            //@ts-ignore
            hasValue: toValue(data[path as keyof T]) !== undefined && toValue(data[path]) !== null && toValue(data[path]) !== '',
            isDirty: dirtyFields.value?.includes(path as any)
        }
    }

    const validationGroupState = (group: (keyof T)[]) => ({
        dirty: group.filter(f => dirtyFields.value?.includes(f as any)).length > 0,
        errored: group.filter(f => getErrors(f as any).length > 0).length > 0,
        complete: group.filter(f => getErrors(f as any).length === 0).length > 0
    })

    const hasErrors = computed(() => {
        if (errors.value === null || errors.value === undefined) return false
        else if (Array.isArray(errors.value) && errors.value.length === 0) return false
        else return true
    })

    const isValid = computed(() => {
        return isDirty.value == false && hasErrors.value == false
    })

    const isErrored = computed(() => isDirty.value == true || hasErrors.value == true)

    const isValidating = computed(() => fieldsUnderValidation.value.length > 0)

    return {
        isErrored,
        isValid,
        errors,
        hasErrors,
        isDirty,
        dirtyFields,
        clearErrors,
        getErrors,
        fieldsUnderValidation,
        fieldIsValidating,
        validationState,
        validationGroupState,
        isValidating,
    }
}