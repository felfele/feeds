import * as React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Keyboard,
    Platform,
    ActivityIndicator,
    Alert,
    AlertIOS,
    EmitterSubscription,
    SafeAreaView,
} from 'react-native';
import { AsyncImagePicker } from '../AsyncImagePicker';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { ImagePreviewGrid } from './ImagePreviewGrid';
import { Post } from '../models/Post';
import { ImageData } from '../models/ImageData';
import { SimpleTextInput } from './SimpleTextInput';
import { NavigationHeader } from './NavigationHeader';
import { Debug } from '../Debug';
import { markdownEscape, markdownUnescape } from '../markdown';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../styles';

export interface StateProps {
    navigation: any;
    draft: Post | null;
    name: string;
    avatar: ImageData;
}

export interface DispatchProps {
    onPost: (post: Post) => void;
    onSaveDraft: (draft: Post) => void;
    onDeleteDraft: () => void;
}

type Props = StateProps & DispatchProps;

interface State {
    isKeyboardVisible: boolean;
    isLoading: boolean;
    paddingBottom: number;
    keyboardHeight: number;
    post: Post;
}

export class PostEditor extends React.Component<Props, State> {
    public state: State;

    private keyboardDidShowListener: EmitterSubscription | null = null;
    private keyboardWillShowListener: EmitterSubscription | null = null;
    private keyboardDidHideListener: EmitterSubscription | null = null;

    constructor(props: Props) {
        super(props);
        this.state = {
            isKeyboardVisible: false,
            isLoading: false,
            paddingBottom: 0,
            keyboardHeight: 0,
            post: this.getPostFromDraft(this.props.draft),
        };
    }

    public onKeyboardDidShow = (e: any) => {
        Debug.log('onKeyboardDidShow', this.state.keyboardHeight);

        this.setState({
            isKeyboardVisible: true,
        });
    }

    public onKeyboardWillShow = (e: any) => {
        const extraKeyboardHeight = 15;
        const baseKeyboardHeight = e.endCoordinates ? e.endCoordinates.height : e.end.height;
        this.setState({
            keyboardHeight: baseKeyboardHeight + extraKeyboardHeight,
        });

        Debug.log('onKeyboardWillShow', this.state.keyboardHeight);
    }

    public onKeyboardDidHide = () => {
        Debug.log('onKeyboardDidHide');
        this.setState({
            isKeyboardVisible: false,
            keyboardHeight: 0,
        });
    }

    public componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.onKeyboardDidShow);
        this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this.onKeyboardWillShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.onKeyboardDidHide);
    }

    public unregisterListeners = () => {
        if (this.keyboardDidShowListener) {
            this.keyboardDidShowListener.remove();
            this.keyboardDidShowListener = null;
        }
        if (this.keyboardWillShowListener) {
            this.keyboardWillShowListener.remove();
            this.keyboardWillShowListener = null;
        }
        if (this.keyboardDidHideListener) {
            this.keyboardDidHideListener.remove();
            this.keyboardDidHideListener = null;
        }
    }

    public componentWillUnmount() {
        this.unregisterListeners();
    }

    public render() {
        if (this.state.isLoading) {
            return this.renderActivityIndicator();
        }

        return (
            <SafeAreaView
                style={{flexDirection: 'column', paddingBottom: this.state.keyboardHeight, flex: 1, height: '100%', backgroundColor: 'white'}}
            >
                <NavigationHeader
                    leftButtonText={
                        <Icon
                            name={'close'}
                            size={20}
                            color={Colors.DARK_GRAY}
                        />
                    }
                    onPressLeftButton={this.onCancelConfirmation}
                    rightButtonText1={
                        <Icon
                            name={'send'}
                            size={20}
                            color={Colors.BRAND_PURPLE}
                        />
                    }
                    onPressRightButton1={this.onPressSubmit}
                    title={this.props.name}
                />
                <View style={{flex: 14, flexDirection: 'column'}}>
                    <SimpleTextInput
                        style={{
                            marginTop: 0,
                            flex: 3,
                            fontSize: 16,
                            padding: 10,
                            paddingVertical: 10,
                            textAlignVertical: 'top',
                        }}
                        multiline={true}
                        numberOfLines={4}
                        onChangeText={this.onChangeText}
                        defaultValue={this.state.post.text}
                        placeholder="What's up?"
                        placeholderTextColor='gray'
                        underlineColorAndroid='transparent'
                        autoFocus={true}
                        testID='PostEditor/TextInput'
                    />
                    <ImagePreviewGrid
                        columns={4}
                        images={this.state.post.images}
                        onRemoveImage={this.onRemoveImage}
                        height={100}
                    />
                </View>
                <View style={{
                    flexDirection: 'row',
                    borderTopWidth: 1,
                    borderTopColor: 'lightgray',
                    padding: 5,
                    margin: 0,
                    height: 30,
                    maxHeight: 30,
                }}>
                    {this.renderActionButton(this.openImagePicker, 'Photos/videos', 'md-photos', '#808080', true)}
                </View>
            </SafeAreaView>
        );
    }

    private onRemoveImage = (removedImage: ImageData) => {
        const images = this.state.post.images.filter(image => image != null && image.uri !== removedImage.uri);
        const post = {
            ...this.state.post,
            images,
        };
        this.setState({
            post,
        });
    }

    private onChangeText = (text: string) => {
        const post: Post = {
            ...this.state.post,
            text: text,
        };
        this.setState({
            post,
        });
    }

    private getPostFromDraft = (draft: Post | null): Post => {
        if (draft != null) {
            return {
                ...draft,
                text: markdownUnescape(draft.text),
            };
        } else {
            return {
                images: [],
                text: '',
                createdAt: Date.now(),
            };
        }
    }

    private onDiscard = () => {
        this.props.onDeleteDraft();
        this.onCancel();
    }

    private onSave = () => {
        this.setState({
           isLoading: true,
        });

        Debug.log(this.state.post);

        this.props.onSaveDraft(this.state.post);
        this.onCancel();
    }

    private onCancel = () => {
        this.hideKeyboard();
        this.unregisterListeners();
        this.props.navigation.goBack();
    }

    private hideKeyboard = () => {
        if (this.state.isKeyboardVisible) {
            Keyboard.dismiss();
            this.setState({
                isKeyboardVisible: false,
            });
        }
    }

    private showCancelConfirmation = () => {
        const options: any[] = [
            { text: 'Save', onPress: () => this.onSave() },
            { text: 'Discard', onPress: () => this.onDiscard() },
            { text: 'Cancel', onPress: () => Debug.log('Cancel Pressed'), style: 'cancel' },
        ];

        if (Platform.OS === 'ios') {
            AlertIOS.alert(
                'Save this post as a draft?',
                undefined,
                options,
            );
        }
        else {
            Alert.alert('Save this post as a draft?',
                undefined,
                options,
                { cancelable: true },
            );
        }
    }

    private onCancelConfirmation = () => {
        Debug.log('onCancelConfirmation', this.state.isKeyboardVisible);
        this.hideKeyboard();
        Debug.log('Cancel');
        if (this.state.post.text !== '' || this.state.post.images.length > 0) {
            this.showCancelConfirmation();
        } else {
            this.onCancel();
        }
    }

    private openImagePicker = async () => {
        const imageData = await AsyncImagePicker.launchImageLibrary();
        if (imageData != null) {
            const images = this.state.post.images.concat([imageData]);
            const post = {
                ...this.state.post,
                images,
            };
            this.setState({
                post,
            });
        }
    }

    private onPressSubmit = () => {
        if (this.state.isLoading) {
            return;
        }

        this.sendUpdate();
        this.onCancel();
    }

    private sendUpdate = () => {
        this.setState({
           isLoading: true,
           post: {
            ...this.state.post,
            text: markdownEscape(this.state.post.text),
           },
        }, () => {
            Debug.log(this.state.post);
            this.props.onPost(this.state.post);
        });
    }

    private renderActivityIndicator() {
        return (
            <View
                style={{
                    flexDirection: 'column',
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    width: '100%',
                }}
            >
                <ActivityIndicator style={{width: '100%', height: 120, flex: 5}} />
            </View>
        );
    }

    private renderActionButton(onPress: () => void, text: string, iconName: string, color: string, showText: boolean) {
        const iconSize = showText ? 20 : 30;
        const justifyContent = showText ? 'center' : 'space-around';
        return (
            <TouchableOpacity onPress={onPress} style={{margin: 0, padding: 0, flex: 1, justifyContent: justifyContent}}>
                <View style={{
                    flex: 1,
                    flexDirection: 'row',
                    margin: 0,
                    padding: 0,
                    alignItems: 'center',
                    justifyContent: justifyContent,
                }}>
                    <View style={{flex: 1, justifyContent: 'center'}}><Ionicons name={iconName} size={iconSize} color={color} /></View>
                    { showText &&
                        <Text style={{fontSize: 14, flex: 10}}>{text}</Text>
                    }
                </View>
            </TouchableOpacity>
        );
    }
}