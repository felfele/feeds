import * as React from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import SplashScreen from 'react-native-splash-screen'

import { RefreshableFeed } from '../../misc/RefreshableFeed'
import { Feed } from '../../../models/Feed'
import { Post } from '../../../models/Post'
import { NavigationHeader } from '../../misc/NavigationHeader'
import { ComponentColors } from '../../../styles'
import { TypedNavigation } from '../../../helpers/navigation'
import { View } from 'react-native'

export interface DispatchProps {
    onRefreshPosts: (feeds: Feed[]) => void
}

export interface StateProps {
    navigation: TypedNavigation
    posts: Post[]
    feeds: Feed[]
    gatewayAddress: string
}

type Props = StateProps & DispatchProps

export class PublicChannelsScreen extends React.Component<Props> {
    private ref?: RefreshableFeed = undefined
    public render() {
        return (
            <RefreshableFeed
                {...this.props}
                ref={value => this.ref = value || undefined}
            >
                {{
                    navigationHeader:
                        <NavigationHeader
                            title='Feeds'
                            leftButton={{
                                onPress: () => this.props.navigation.navigate('PublicChannelsListContainer', {
                                    showExplore: true,
                                }),
                                label: <Icon
                                    name={'apps'}
                                    size={24}
                                    color={ComponentColors.NAVIGATION_BUTTON_COLOR}
                                />,
                            }}
                            rightButton1={{
                                onPress: () => this.props.navigation.navigate('FeedLinkReader', {}),
                                label: <Icon
                                    name='plus-box'
                                    size={24}
                                    color={ComponentColors.NAVIGATION_BUTTON_COLOR}
                                />,
                            }}
                            onPressTitle={this.ref && this.ref.scrollToTop}
                        />,
                    listHeader: <View style={{paddingTop: 10}}/>,
                }}
            </RefreshableFeed>
        )
    }

    public componentDidMount() {
        SplashScreen.hide()
    }
}
