export function resolveXClip(left: number, elWidth: number, scrollX = 0)
{
    // Right clip
    if ((left + elWidth) > (window.innerWidth + scrollX)) {
        return window.innerWidth - scrollX - elWidth - 10
    }

    // Left clip
    else if (left < 0) {
        return 10
    }

    // No clip
    else {
        return left
    }
}

export function resolveYClip(top: number, elHeight: number, scrollY = 0)
{
    // Bottom clip
    if ((top + elHeight) > (window.innerHeight + scrollY)) {
        return window.innerHeight + scrollY - elHeight - 10
    }

    // Top clip
    else if (top < 0) {
        return 10
    }

    // No clip
    else {
        return top
    }
}