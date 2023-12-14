import { Model } from './Model'
import { ImageData } from './ImageData'
import { Author } from './Author'
import { HexString } from '../helpers/opaqueTypes'
import { RSSItem } from '../helpers/RSSFeedHelpers'

export interface PublicPost extends Model {
    images: ImageData[]
    text: string
    createdAt: number
}

export interface Post extends PublicPost {
    link?: string
    author?: Author
    updatedAt?: number
    isUploading?: boolean
    topic?: HexString
    rssItem?: RSSItem
}
