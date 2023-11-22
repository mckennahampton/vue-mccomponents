export function formatBytes(bytes: number, decimals: number = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function numberFriendlyFormat(num: number, digits?: number) {
    if (isNaN(num)) {
        return 0;
    }
    if (num > 1000000000) {
        return (num / 1000000000).toLocaleString(undefined, {
            minimumFractionDigits: digits ?? (Number.isInteger(num / 1000000000) ? 0 : 1)
        }) + 'Bn'
    } else if (num > 1000000) {
        return (num / 1000000).toLocaleString(undefined, {
            minimumFractionDigits: digits ?? (Number.isInteger(num / 1000000) ? 0 : 1)
        }) + 'M'
    } else if (num > 1000) {
        return (num / 1000).toLocaleString(undefined, {
            minimumFractionDigits: digits ?? (Number.isInteger(num / 1000) ? 0 : 1)
        }) + 'K'
    }
    return num.toLocaleString(undefined, {
        minimumFractionDigits: digits ?? (Number.isInteger(num) ? 0 : 1)
    });
}

export const formatUSD = (val: number) => {
    let USDollar = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    })
    return USDollar.format(val).replace('-0', '0')
}