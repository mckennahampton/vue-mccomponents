export interface ImageDimensions {
    width: number,
    height: number,
  }
  
  export const getImageDimensions = (src: string) => {
      return new Promise((resolve) => {
        let img = new Image()
        img.onload = () => resolve({height: img.height, width: img.width})
        img.onerror = (err) => {
          console.log({
              error: err,
              source: src
          })
        }
        img.src = src
      })
  }
  
  export const loadImagePreview = (file: File | Blob) => {
    return new Promise((resolve) => {
    var reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = (err) => {
            console.log({
                error: err,
                file: file
            })
        }
        reader.readAsDataURL(file)
    })
  }