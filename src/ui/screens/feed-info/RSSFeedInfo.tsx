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
import * as AreYouSureDialog from '../../../helpers/AreYouSureDialog';
import { TypedNavigation } from '../../../helpers/navigation';
import { FragmentSafeAreaViewWithoutTabBar } from '../../misc/FragmentSafeAreaView';
import { RegularText } from '../../misc/text';
import { ImageDataView } from '../../misc/ImageDataView';
import { getFeedImage } from '../../../helpers/feedHelpers';
import { WideButton } from '../../buttons/WideButton';
import { TwoButton } from '../../buttons/TwoButton';

export interface DispatchProps {
    onAddFeed: (feed: Feed) => void;
    onRemoveFeed: (feed: Feed) => void;
    onUnfollowFeed: (feed: Feed) => void;
}

export interface StateProps {
    feed: Feed;
    navigation: TypedNavigation;
    isKnownFeed: boolean;
}

type Props = DispatchProps & StateProps;

const PUBLIC_CHANNEL_LABEL = 'This is a public channel.';
const NOT_FOLLOWED_STATUS = 'You are not following it.';
const FOLLOWED_STATUS = 'You are following it.';

export class RSSFeedInfo extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const imageWidth = Dimensions.get('window').width * 0.7;
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
                onPress: () => this.props.onAddFeed(this.props.feed),
            }
        ;
        return (
            <FragmentSafeAreaViewWithoutTabBar>
                <NavigationHeader
                    title={this.props.feed.name}
                    navigation={this.props.navigation}
                />
                <View style={styles.container}>
                    <ImageDataView
                        source={getFeedImage(this.props.feed)}
                        style={{
                            width: imageWidth,
                            height: imageWidth,
                            alignSelf: 'center',
                            marginVertical: 20,
                        }}
                        resizeMode='cover'
                    />
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
        const confirmUnfollow = await AreYouSureDialog.show(
            'Are you sure you want to unfollow?',
            'This will remove this channel from your Public channels feed and you will no longer get updates from it.'
        );
        if (confirmUnfollow) {
            this.props.onUnfollowFeed(this.props.feed);
        }
    }

    private onRemoveFeed = async () => {
        const confirmUnfollow = await AreYouSureDialog.show(
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
});
