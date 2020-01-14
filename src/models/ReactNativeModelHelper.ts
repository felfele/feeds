import * as RNFS from 'react-native-fs';

import { ModelHelper } from './ModelHelper';
import { ImageData, BundledImage } from './ImageData';
import { isBundledImage } from '../helpers/imageDataHelpers';

const FILE_PROTOCOL = 'file://';

export class ReactNativeModelHelper implements ModelHelper {
    public constructor() {
    }

    public getLocalPath(localPath: string): string {
        if (localPath.startsWith(FILE_PROTOCOL)) {
            return localPath;
        }
        const documentPath = FILE_PROTOCOL + RNFS.DocumentDirectoryPath + '/';
        return documentPath + localPath;
    }

    public getImageUri(image: ImageData): string | BundledImage {
        if (isBundledImage(image.localPath)) {
            return image.localPath;
        }
        if (image.uri != null) {
            return image.uri;
        }
        if (image.data != null) {
            return `data:image/png;base64,${image.data}`;
        }
        return '';
    }
}
