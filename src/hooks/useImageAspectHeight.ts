import { useEffect, useState } from 'react'
import { Image } from 'react-native'

export const useImageAspectHeight = (imageUrl: string, width: number) => {
  const [imageHeightWidth, setImageHeightWidth] = useState({
    height: 0,
    width: 0,
  })
  useEffect(() => {
    if (!imageUrl || !width || imageHeightWidth.height) return
    Image.getSize(
      imageUrl,
      (width, height) => {
        setImageHeightWidth({ height: height, width: width })
      },
      error => {
        // console.error(`Error getting image size: ${error.message}`)
      },
    )
  }, [])
  const containerHeight =
    (imageHeightWidth.height / imageHeightWidth.width) * width
  return isNaN(containerHeight) ? 0 : containerHeight
}
