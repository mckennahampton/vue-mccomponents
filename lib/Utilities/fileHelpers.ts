export const toBase64 = async (path: string): Promise<string> => 
    fetch(path)
    .then(response => response.blob())
    .then(blob => new Promise ((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader?.result?.toString() ?? '')
        reader.onerror = reject
        reader.readAsDataURL(blob)
    })
)