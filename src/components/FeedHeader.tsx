import * as React from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Alert,
    CameraRoll,
    Platform,
    StyleSheet,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AsyncImagePicker, Response as ImagePickerResponse } from '../AsyncImagePicker';
import { Config } from '../Config';
import { PostManager } from '../PostManager';
import { Post, ImageData } from '../models/Post';

interface FeedHeaderProps {
    navigation: any;
    postManager: PostManager;
}

export class FeedHeader extends React.PureComponent<FeedHeaderProps> {
    public isCameraRollPhoto(pickerResult: ImagePickerResponse) {
        if (pickerResult.origURL != null && pickerResult.origURL.startsWith('assets-library://')) {
            return true;
        }
        if (pickerResult.uri != null && pickerResult.uri.startsWith('content://media')) {
            return true;
        }
        return false;
    }

    public getFilenameExtension(filename) {
        const a = filename.split('.');
        if (a.length === 1 || ( a[0] === '' && a.length === 2 ) ) {
            return '';
        }
        return a.pop().toLowerCase();
    }

    public openImagePicker = async () => {
        const pickerResult = await AsyncImagePicker.showImagePicker({
            allowsEditing: false,
            aspect: [4, 3],
            base64: true,
            exif: true,
        });
        console.log('openImagePicker result: ', pickerResult);

        if (pickerResult.error) {
            console.log('openImagePicker error: ', pickerResult.error);
            return;
        }

        console.log('openImagePicker before didCancel');
        if (pickerResult.didCancel) {
            return;
        }

        let localPath = pickerResult.uri || '';
        const isCameraRollPhoto = this.isCameraRollPhoto(pickerResult);
        console.log('isCameraRollPhoto: ', isCameraRollPhoto);
        if (!isCameraRollPhoto && Config.saveToCameraRoll) {
            if (Platform.OS === 'ios') {
                localPath = await CameraRoll.saveToCameraRoll(pickerResult.uri);
            } else {
                localPath = await CameraRoll.saveToCameraRoll('file://' + pickerResult.path);
            }
        }

        console.log('openImagePicker: localPath: ', localPath);
        const data: ImageData = {
            uri: localPath,
            width: pickerResult.width,
            height: pickerResult.height,
            data: pickerResult.data,
            localPath: localPath,
        };

        const post: Post = {
            images: [data],
            text: '',
            createdAt: Date.now(),
        };

        try {
            this.props.postManager.saveAndSyncPost(post);
        } catch (e) {
            Alert.alert(
                'Error',
                'Posting failed, try again later!',
                [
                    { text: 'OK', onPress: () => {console.log('OK pressed'); } },
                ]
            );
        }
    }

    public render() {
        return (
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={this.openImagePicker} style={{ flex: 1 }}>
                    <Icon
                        name='camera-alt'
                        size={30}
                        color='gray'
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() =>
                        this.props.navigation.navigate('Post')
                    }
                    style={{
                        flex: 6,
                    }}
                >
                    <Text style={styles.headerText}
                    >What's your story?</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const HeaderContainerPaddingTop = Platform.OS === 'ios' ? 20 : 0;
const styles = StyleSheet.create({
    headerContainer: {
        flex: -1,
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: 'lightgray',
        alignContent: 'stretch',
        marginTop: HeaderContainerPaddingTop,
    },
    cameraIcon: {
        paddingTop: 4,
        paddingLeft: 10,
        margin: 0,
    },
    headerText: {
        height: 30,
        color: 'gray',
        fontSize: 14,
        paddingLeft: 15,
        paddingTop: 6,
        marginLeft: 0,
        marginRight: 15,
        marginVertical: 3,
        marginBottom: 15,
        alignSelf: 'stretch',
        flex: 5,
        flexGrow: 10,
    },
});
