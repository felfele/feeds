import { Alert, ShareContent, Share } from 'react-native';

export const areYouSureDialog = async (title: string, message?: string): Promise<boolean> => {
    const promise = new Promise<boolean>((resolve, reject) => {
        const options: any[] = [
            { text: 'Yes', onPress: () => resolve(true)},
            { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
        ];

        Alert.alert(title,
            message,
            options,
            { cancelable: true },
        );
    });

    return promise;
};

export const errorDialog = async (title: string, errorText?: string, okText: string = 'Ok'): Promise<boolean> => {
    const promise = new Promise<boolean>((resolve, reject) => {
        const options: any[] = [
            { text: okText, onPress: () => resolve(true)},
        ];

        Alert.alert(title,
            errorText,
            options,
            { cancelable: true },
        );
    });

    return promise;
};

export const shareDialog = async (title: string, message: string) => {
    const content: ShareContent = {
        title,
        message,
    };
    await Share.share(content);
};
