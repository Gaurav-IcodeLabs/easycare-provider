import { ImageVariants } from './types'

export interface UUID {
  _sdkType: string
  uuid: string
}

export interface Image {
  id: UUID
  type: string
  attributes: ImageAttributes
}

export interface ImageData {
  height: number
  width: number
  url: string
  name: string
}

export type ImageVariantsMap = Record<ImageVariants, ImageData>

export interface ImageAttributes {
  variants: ImageVariantsMap
}

export type AspectRatio =
  | '1/1'
  | '16/9'
  | '2/3'
  | 'original'
  | undefined
  | string
