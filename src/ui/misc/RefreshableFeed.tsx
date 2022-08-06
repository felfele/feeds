import * as React from 'react'
import {
    View,
    FlatList,
    RefreshControl,
    LayoutAnimation,
} from 'react-native'
import { Post } from '../../models/Post'
import { ComponentColors, Colors } from '../../styles'
import { Feed } from '../../models/Feed'
import { CardContainer } from '../card/CardContainer'
import { Props as NavHeaderProps } from './NavigationHeader'
import { TypedNavigation } from '../../helpers/navigation'
import { FragmentSafeAreaView } from './FragmentSafeAreaView'

export interface DispatchProps {
    onRefreshPosts: (feeds: Array<Feed>) => void
}

export interface StateProps {
    navigation: TypedNavigation
    posts: Post[]
    feeds: Array<Feed>
    children: {
        // WARNING, type parameter included for reference, but it does not typecheck
        listHeader?: React.ReactElement<any>
        listFooter?: React.ReactElement<any>
        navigationHeader?: React.ReactElement<NavHeaderProps>
        placeholder?: React.ReactElement<any>
    }
}

type Props = DispatchProps & StateProps

interface RefreshableFeedState {
    selectedPost: Post | null
    isRefreshing: boolean
}

export class RefreshableFeed extends React.PureComponent<Props, RefreshableFeedState> {
    public state: RefreshableFeedState = {
        selectedPost: null,
        isRefreshing: false,
    }

    private flatList?: FlatList<Post> = undefined

    public scrollToTop = () => {
        if (this.flatList != null) {
            this.flatList.scrollToOffset({offset: 0})
        }
    }

    public componentDidUpdate(prevProps: Props) {
        if (this.props.posts !== prevProps.posts) {
            this.setState({
                isRefreshing: false,
            })
        }
    }

    public render() {
        return (
            <FragmentSafeAreaView>
                {this.props.children.navigationHeader}
                {this.props.feeds.length === 0 && this.props.children.placeholder}
                <FlatList
                    ListHeaderComponent={this.props.children.listHeader}
                    ListFooterComponent={this.renderListFooter}
                    data={this.props.posts}
                    renderItem={(obj) => (
                        <CardContainer
                            post={obj.item}
                            isSelected={this.isPostSelected(obj.item)}
                            navigation={this.props.navigation}
                            togglePostSelection={this.togglePostSelection}
                        />
                    )}
                    keyExtractor={(item) => '' + (item.link || '') + '/' + item._id + '/' + (item.topic || '')}
                    extraData={this.state}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.isRefreshing}
                            onRefresh={() => this.onRefresh() }
                            progressViewOffset={HeaderOffset}
                            tintColor={ComponentColors.SPINNER_COLOR}
                            colors={[ComponentColors.SPINNER_COLOR]}
                        />
                    }
                    style={{
                        backgroundColor: ComponentColors.BACKGROUND_COLOR,
                    }}
                    ref={value => this.flatList = value || undefined}
                />
            </FragmentSafeAreaView>
        )
    }

    private onRefresh() {
        this.setState({
            isRefreshing: true,
        })
        this.props.onRefreshPosts(this.props.feeds)
    }

    private isPostSelected = (post: Post): boolean => {
        return this.state.selectedPost != null && this.state.selectedPost._id === post._id
    }

    private togglePostSelection = (post: Post) => {
        LayoutAnimation.easeInEaseOut()
        if (this.isPostSelected(post)) {
            this.setState({ selectedPost: null })
        } else {
            this.setState({ selectedPost: post })
        }
    }

    private renderListFooter = () => {
        return (
            <View style={{flexDirection: 'column'}}>
                {this.props.children.listFooter}
                <View style={{
                    height: 100,
                }}
                />
            </View>
        )
    }
}

const HeaderOffset = 20
