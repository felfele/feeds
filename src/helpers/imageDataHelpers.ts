import { ImageData, BundledImage } from '../models/ImageData';

export interface Rectangle {
    width: number;
    height: number;
}

export const getImageSource = (
    imageData: ImageData,
    defaultImage?: BundledImage,
): BundledImage | { uri: string } => {
    const sourceImageUri = getImageUri(imageData);
    if (isBundledImage(sourceImageUri)) {
        return sourceImageUri;
    }
    const source = sourceImageUri !== '' || defaultImage == null
        ? { uri: sourceImageUri }
        : defaultImage
    ;
    return source;
};

export const isBundledImage = (path?: string | BundledImage): path is BundledImage => {
    return typeof path === 'number';
};

export const calculateImageDimensions = (image: ImageData, maxWidth: number, maxHeight: number): Rectangle => {
    if (image.width == null || image.height == null) {
        return {
            width: maxWidth,
            height: maxHeight,
        };
    }
    const ratio = image.width / maxWidth;
    const height = image.height / ratio;
    return {
        width: maxWidth,
        height: height,
    };
};

export const getImageUri = (image: ImageData): string | BundledImage => {
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
};
