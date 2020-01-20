import * as React from 'react';
import { Post } from '../../models/Post';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../styles';
import {
    View,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
    Linking,
} from 'react-native';
import { TouchableView } from '../misc/TouchableView';
import { DateUtils } from '../../DateUtils';
import * as urlUtils from '../../helpers/urlUtils';
import { ImageDataView } from '../misc/ImageDataView';
import { MediumText, RegularText } from '../misc/text';
import { Avatar } from '../misc/Avatar';
import { CardMarkdown } from './CardMarkdown';
import { Feed } from '../../models/Feed';
import { DEFAULT_AUTHOR_NAME } from '../../reducers/defaultData';
import { TypedNavigation } from '../../helpers/navigation';
import { calculateImageDimensions } from '../../helpers/imageDataHelpers';

export type AuthorFeed = UIFeed;

export interface UIFeed extends Feed {
    isKnownFeed: boolean;
}

export interface StateProps {
    isSelected: boolean;
    post: Post;
    currentTimestamp: number;
    togglePostSelection: (post: Post) => void;
    navigation: TypedNavigation;
    authorFeed: AuthorFeed | undefined;
    originalAuthorFeed: AuthorFeed | undefined;
}

export interface DispatchProps {
    onDeletePost: (post: Post) => void;
    onSharePost: (post: Post) => void;
    onDownloadFeedPosts: (feed: Feed) => void;
}

type CardProps = StateProps & DispatchProps;

export const Card = (props: CardProps) => {
    const width = Dimensions.get('screen').width;
    return (
        <View
            testID={'YourFeed/Post' + props.post._id}
            style={styles.containerPadding}
        >
            <View style={styles.container}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => openPost(props.post)}
                >
                    <CardBody
                        {...props}
                        width={width}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const CardBody = (props: {
    post: Post,
    currentTimestamp: number,
    width: number,
    navigation: TypedNavigation,
    originalAuthorFeed: AuthorFeed | undefined,
    authorFeed: AuthorFeed | undefined;
    togglePostSelection?: (post: Post) => void;
    onDownloadFeedPosts: (feed: Feed) => void;
}) => {
    const isOriginalPost = props.post.references == null;
    const originalAuthor = props.post.references != null
        ? props.post.references.originalAuthor
        : props.post.author
    ;
    const originalPost = {
        ...props.post,
        author: originalAuthor,
        references: undefined,
    };
    const authorFeed = props.authorFeed;
    const cardTopOnPress = authorFeed != null
        ? authorFeed.feedUrl !== ''
            ?   () => {
                props.onDownloadFeedPosts(authorFeed);
                props.navigation.navigate('NewsSourceFeed', {
                    feed: authorFeed,
                });
            }
            : undefined
        : undefined
    ;
    return (
        <View>
            <CardTop
                post={props.post}
                currentTimestamp={props.currentTimestamp}
                togglePostSelection={props.togglePostSelection}
                onPress={cardTopOnPress}
            />
            {
                isOriginalPost
                    ?
                    <View>
                        <DisplayImage
                            post={props.post}
                            width={props.width}
                        />
                        {
                            props.post.text === '' || <CardMarkdown text={props.post.text} />
                        }
                    </View>
                    :
                    <View style={styles.previewContainer}>
                        <CardBody
                            {...props}
                            authorFeed={props.originalAuthorFeed}
                            originalAuthorFeed={undefined}
                            togglePostSelection={undefined}
                            post={originalPost}
                            currentTimestamp={originalPost.createdAt}
                            width={props.width - 22}
                        />
                    </View>
            }
        </View>
    );
};

const DisplayImage = (props: {
    post: Post,
    width: number,
}) => {
    if (props.post.images.length === 0) {
        return null;
    } else {
        const image = props.post.images[0];
        const defaultImageWidth = props.width;
        const defaultImageHeight = Math.floor(defaultImageWidth * 0.66);

        const { width, height } = calculateImageDimensions(image, defaultImageWidth, defaultImageHeight);
        return (
            <ImageDataView
                testID={(image.uri || '')}
                key={(image.uri || '')}
                source={image}
                style={{
                    width: width,
                    height: height,
                }}
            />
        );
    }
};

export const MemoizedCard = React.memo(Card);

const ActionIcon = (props: { name: string, color: string, iconSize?: number }) => {
    const iconSize = props.iconSize ||  20;
    return <Icon name={props.name} size={iconSize} color={props.color}/>;
};

const CardTopIcon = (props: { post: Post }) => {
    if (props.post.author) {
        return (
            <Avatar image={props.post.author.image} size='large'/>
        );
    } else {
        return <View/>;
    }
};

const CardTop = (props: {
    post: Post,
    currentTimestamp: number,
    togglePostSelection?: (post: Post) => void,
    onPress?: () => void;
}) => {
    const postUpdateTime = props.post.updatedAt || props.post.createdAt;
    const printableTime = DateUtils.printableElapsedTime(postUpdateTime, props.currentTimestamp) + ' ago';
    const authorName = props.post.author ? props.post.author.name : DEFAULT_AUTHOR_NAME;
    const url = props.post.link || '';
    const hostnameText = url === '' ? '' : urlUtils.getHumanHostname(url);
    const timeHostSeparator = printableTime !== '' && hostnameText !== '' ? ' - ' : '';
    return (
        <TouchableOpacity
            testID={'CardTop'}
            onPress={props.onPress}
            style={styles.infoContainer}
        >
            <CardTopIcon post={props.post} />
            <View style={styles.usernameContainer}>
                <View style={{flexDirection: 'row'}}>
                    <MediumText style={styles.username} numberOfLines={1}>{authorName}</MediumText>
                </View>
                <RegularText numberOfLines={1} style={styles.location}>{printableTime}{timeHostSeparator}{hostnameText}</RegularText>
            </View>
            {
                props.togglePostSelection &&
                <TouchableView
                    style={{
                        paddingRight: 10,
                    }}
                    onPress={() => props.togglePostSelection!(props.post)}>
                    <ActionIcon name='dots-vertical' color={Colors.PINKISH_GRAY}/>
                </TouchableView>

            }
        </TouchableOpacity>
    );
};

const openPost = async (post: Post) => {
    if (post.link) {
        await Linking.openURL(post.link);
    }
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.WHITE,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },
    containerPadding: {
        paddingBottom: 12,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 100,
        backgroundColor: 'rgba(98, 0, 234, 0.5)',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
    },
    infoContainer : {
        flexDirection: 'row',
        height: 38,
        alignSelf: 'stretch',
        alignItems: 'center',
        marginVertical: 14,
        marginLeft: 10,
    },
    usernameContainer: {
        justifyContent: 'center',
        flexDirection: 'column',
        marginLeft: 10,
        flex: 1,
    },
    location: {
        fontSize: 14,
        color: Colors.DARK_GRAY,
    },
    actionButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 1,
        borderColor: Colors.WHITE,
        backgroundColor: Colors.BRAND_PURPLE,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 15,
    },
    username: {
        fontSize: 14,
        color: Colors.DARK_GRAY,
    },
    originalAuthor: {
        fontSize: 14,
        fontWeight: 'normal',
        color: Colors.GRAY,
    },
    previewContainer: {
        marginHorizontal: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.LIGHT_GRAY,
        flexDirection: 'column',
    },
});
