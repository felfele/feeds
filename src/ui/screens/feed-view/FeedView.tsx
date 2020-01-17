import * as React from 'react';
import { RefreshableFeed } from '../../misc/RefreshableFeed';
import { Feed } from '../../../models/Feed';
import { Post } from '../../../models/Post';
import { NavigationHeader, HeaderDefaultLeftButtonIcon } from '../../misc/NavigationHeader';
import { ComponentColors } from '../../../styles';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Dialogs from '../../../helpers/dialogs';
import { FELFELE_ASSISTANT_URL } from '../../../reducers/defaultData';
import { TypedNavigation } from '../../../helpers/navigation';
import { isFelfeleResource } from '../../../helpers/urlUtils';
import { WideButton } from '../../buttons/WideButton';
import { View, GestureResponderEvent, ActivityIndicator } from 'react-native';

export interface DispatchProps {
    onRefreshPosts: (feeds: Feed[]) => void;
    onFollowFeed: (feed: Feed) => void;
    onUnfollowFeed: (feed: Feed) => void;
    onToggleFavorite: (feedUrl: string) => void;
    onRemoveFeed: (feed: Feed) => void;
}

export interface StateProps {
    navigation: TypedNavigation;
    onBack: () => void;
    feed: Feed;
    posts: Post[];
}

type Props = StateProps & DispatchProps;

const icon = (name: string, color: string) => <Icon name={name} size={20} color={color} />;

const ListHeader = (props: {
    isFollowed: boolean,
    onPressFollow: () => void,
    isLoading: boolean,
}) => (
    <View style={{flexDirection: 'row'}}>
        { props.isFollowed &&
            <WideButton
                label='Follow this channel'
                icon={icon('link', ComponentColors.BUTTON_COLOR)}
                onPress={props.onPressFollow}
            />
        }
        { props.isLoading &&
            <View style={{alignContent: 'center', width: '100%', paddingVertical: 20}}>
                <ActivityIndicator size='large' color='grey'/>
            </View>
        }
    </View>
);

export const FeedView = (props: Props) => {
    const isOnboardingFeed = props.feed.feedUrl === FELFELE_ASSISTANT_URL;

    const button = (iconName: string, color: string, onPress: () => void) => ({
        label: icon(iconName, color),
        onPress,
    });
    const isUrlFelfeleResource = isFelfeleResource(props.feed.feedUrl);
    const navigateToFeedInfo = () => props.navigation.navigate(
        isUrlFelfeleResource ? 'FeedInfo' : 'RSSFeedInfo', {
            feed: props.feed,
        }
    );
    const rightButton1 = isOnboardingFeed
        ? undefined
        : button('information', ComponentColors.NAVIGATION_BUTTON_COLOR, navigateToFeedInfo)
    ;
    const refreshableFeedProps = {
        ...props,
        feeds: [props.feed],
    };
    return (
        <RefreshableFeed {...refreshableFeedProps}>
            {{
                navigationHeader: <NavigationHeader
                    navigation={props.navigation}
                    leftButton={{
                        onPress: props.onBack,
                        label: HeaderDefaultLeftButtonIcon,
                    }}
                    rightButton1={rightButton1}
                    title={props.feed.name}
                />,
                listHeader: <ListHeader
                    isFollowed={props.feed.followed === true}
                    onPressFollow={() => props.onFollowFeed(props.feed)}
                    isLoading={props.posts.length === 0}
                />,
            }}
        </RefreshableFeed>
    );
};

export const unfollowFeed = async (feed: Feed, onUnfollowFeed: (feed: Feed) => void) => {
    const confirmUnfollow = await Dialogs.areYouSureDialog('Are you sure you want to unfollow?');
    if (confirmUnfollow) {
        onUnfollowFeed(feed);
    }
};
