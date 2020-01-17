import * as React from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
} from 'react-native';

import { Feed } from '../../../models/Feed';
import { ComponentColors, Colors } from '../../../styles';
import { NavigationHeader } from '../../misc/NavigationHeader';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Dialogs from '../../../helpers/dialogs';
import { TypedNavigation } from '../../../helpers/navigation';
import { FragmentSafeAreaViewWithoutTabBar } from '../../misc/FragmentSafeAreaView';
import { RegularText } from '../../misc/text';
import { ImageDataView } from '../../misc/ImageDataView';
import { getFeedImage } from '../../../helpers/feedHelpers';
import { WideButton } from '../../buttons/WideButton';
import { TwoButton } from '../../buttons/TwoButton';
import QRCode from 'react-native-qrcode-svg';

const IMAGE_WIDTH = Dimensions.get('window').width * 0.6;

export interface DispatchProps {
    onFollowFeed: (feed: Feed) => void;
    onRemoveFeed: (feed: Feed) => void;
    onUnfollowFeed: (feed: Feed) => void;
}

export interface StateProps {
    feed: Feed;
    navigation: TypedNavigation;
    isKnownFeed: boolean;
}

type Props = DispatchProps & StateProps;

interface State {
    imageToShow: 'image' | 'qrcode';
}

const PUBLIC_CHANNEL_LABEL = 'This is a public channel.';
const NOT_FOLLOWED_STATUS = 'You are not following it.';
const FOLLOWED_STATUS = 'You are following it.';

const QRCodeView = (props: {data: string}) => (
    <View style={styles.imageStyle}>
        <QRCode
            value={props.data}
            size={IMAGE_WIDTH}
            color={Colors.BLACK}
            backgroundColor={ComponentColors.BACKGROUND_COLOR}
        />
    </View>
);

export class RSSFeedInfo extends React.Component<Props, State> {
    public state: State = {
        imageToShow: 'image',
    };

    constructor(props: Props) {
        super(props);
    }

    public render() {
        const followToggleButton = this.props.feed.followed
            ? {
                label: 'Unfollow',
                icon: <Icon name='link-off' size={24} color={Colors.DARK_RED}/>,
                style: styles.buttonStyle,
                fontStyle: { color: Colors.DARK_RED },
                onPress: this.onUnfollowFeed,
            }
            : {
                label: 'Follow',
                icon: <Icon name='link' size={24} color={Colors.BRAND_PURPLE}/>,
                style: styles.buttonStyle,
                onPress: () => this.props.onFollowFeed(this.props.feed),
            }
        ;
        const imageToShow = this.state.imageToShow === 'image'
            ? <ImageDataView
                source={getFeedImage(this.props.feed)}
                style={styles.imageStyle}
                resizeMode='cover'
            />
            : <QRCodeView data={this.props.feed.feedUrl} />
        ;
        const rightButton = this.state.imageToShow === 'image'
            ? {
                label: <Icon name='qrcode' size={24} color={ComponentColors.NAVIGATION_BUTTON_COLOR} />,
                onPress: () => this.setState({imageToShow: 'qrcode'}),
            }
            : {
                label: <Icon name='image' size={24} color={ComponentColors.NAVIGATION_BUTTON_COLOR} />,
                onPress: () => this.setState({imageToShow: 'image'}),
            }
        ;
        return (
            <FragmentSafeAreaViewWithoutTabBar>
                <NavigationHeader
                    title={this.props.feed.name}
                    navigation={this.props.navigation}
                    rightButton1={rightButton}
                />
                <View style={styles.container}>
                    { imageToShow }
                    <RegularText style={styles.explanationText}>{PUBLIC_CHANNEL_LABEL}</RegularText>
                    <RegularText style={styles.explanationText}>{
                        this.props.feed.followed
                            ? FOLLOWED_STATUS
                            : NOT_FOLLOWED_STATUS
                    }</RegularText>
                    {
                        this.props.isKnownFeed && this.props.feed.followed === false
                        ? <TwoButton
                            leftButton={followToggleButton}
                            rightButton={{
                                label: 'Delete',
                                icon: <Icon name='delete' size={24} color={Colors.DARK_RED} />,
                                style: styles.buttonStyle,
                                fontStyle: { color: Colors.DARK_RED},
                                onPress: this.onRemoveFeed,
                            }}
                        />
                        : <WideButton
                            {...followToggleButton}
                        />

                    }
                </View>
            </FragmentSafeAreaViewWithoutTabBar>
        );
    }

    private onUnfollowFeed = async () => {
        const confirmUnfollow = await Dialogs.areYouSureDialog(
            'Are you sure you want to unfollow?',
            'This will remove this channel from your Public channels feed and you will no longer get updates from it.'
        );
        if (confirmUnfollow) {
            this.props.onUnfollowFeed(this.props.feed);
        }
    }

    private onRemoveFeed = async () => {
        const confirmUnfollow = await Dialogs.areYouSureDialog(
            'Are you sure you want to delete channel?',
            'It will be removed from your channel list.'
        );
        if (confirmUnfollow) {
            this.props.onRemoveFeed(this.props.feed);
        }
    }

}

const styles = StyleSheet.create({
    container: {
        backgroundColor: ComponentColors.BACKGROUND_COLOR,
        flex: 1,
        flexDirection: 'column',
    },
    explanationText: {
        color: ComponentColors.HINT_TEXT_COLOR,
        textAlign: 'center',
    },
    buttonStyle: {
        marginTop: 20,
    },
    imageStyle: {
        width: IMAGE_WIDTH,
        height: IMAGE_WIDTH,
        alignSelf: 'center',
        marginVertical: 20,
    },
});
