import * as React from 'react'
import { ImageStyle } from 'react-native'
import { DefaultStyle } from '../../styles'
import { defaultImages } from '../../defaultImages'
import { ImageDataView } from './ImageDataView'
import { ImageData } from '../../models/ImageData'

export const Avatar = React.memo((props: { image: ImageData, style?: ImageStyle, size: 'medium' | 'large' }) => {
    const defaultStyle = props.size === 'large' ? DefaultStyle.faviconLarge : DefaultStyle.faviconMedium
    const defaultImage = defaultImages.defaultUser
    return (
        <ImageDataView
            source={props.image}
            defaultImage={defaultImage}
            style={[defaultStyle, props.style]}
        />
    )
})
