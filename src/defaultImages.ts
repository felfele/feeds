import { BundledImage } from './models/ImageData'

declare var require: (id: string) => BundledImage

export const defaultImages = {
    iconWhiteTransparent: require('../images/icon-white-transparent.png'),
    defaultUser: require('../images/assets/defaultuser.png'),
    felfeleAssistant: require('../images/felfele-assistant.png'),
}
