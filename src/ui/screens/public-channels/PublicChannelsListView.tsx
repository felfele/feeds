import * as React from 'react';
import { StyleSheet, SafeAreaView, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SuperGridSectionList } from 'react-native-super-grid';

import { Feed } from '../../../models/Feed';
import { Colors, ComponentColors } from '../../../styles';
import { NavigationHeader } from '../../../components/NavigationHeader';
import { GridCard, getGridCardSize } from '../../../ui/misc/GridCard';
import { ReactNativeModelHelper } from '../../../models/ReactNativeModelHelper';
import { MediumText } from '../../../ui/misc/text';
import { TabBarPlaceholder } from '../../../ui/misc/TabBarPlaceholder';
import { defaultImages } from '../../../defaultImages';
import { TypedNavigation } from '../../../helpers/navigation';
import { FragmentSafeAreaViewWithoutTabBar } from '../../../ui/misc/FragmentSafeAreaView';
import { TwoButton } from '../../../ui/buttons/TwoButton';
import { getFeedImage } from '../../../helpers/feedHelpers';

export interface DispatchProps {
    onPressFeed: (feed: Feed) => void;
    openExplore: () => void;
}

export interface PublicFeedSection {
    title?: string;
    data: Feed[];
}

export interface StateProps {
    navigation: TypedNavigation;
    sections: PublicFeedSection[];
    gatewayAddress: string;
    title: string;
    showExplore: boolean;
    headerComponent?: React.ComponentType<any> | React.ReactElement<any> | null;
}

export class FeedGrid extends React.PureComponent<DispatchProps & StateProps & { children?: React.ReactNode}> {
    public render() {
        const itemDimension = getGridCardSize();
        return (
            <View style={{ backgroundColor: ComponentColors.BACKGROUND_COLOR, flex: 1 }}>
                {this.props.children}
                {
                // @ts-ignore - SuperGridSectionList is passing props to internal SectionList, typings is missing
                <SuperGridSectionList
                    style={{ flex: 1 }}
                    spacing={10}
                    fixed={true}
                    itemDimension={itemDimension}
                    sections={this.props.sections}
                    renderItem={({ item }: any) => {
                        const image = getFeedImage(item);
                        return (
                            <GridCard
                                title={item.name}
                                image={image}
                                onPress={() => this.props.onPressFeed(item)}
                                size={itemDimension}
                                defaultImage={defaultImages.defaultUser}
                                modelHelper={globalReactNativeModelHelper}
                                isSelected={false}
                            />
                        );
                    }}
                    renderSectionHeader={({ section }) => ( section.title &&
                        <MediumText style={styles.sectionHeader}>{section.title}</MediumText>
                    )}
                    // @ts-ignore - SuperGridSectionList is passing props to internal SectionList, typings is missing
                    ListFooterComponent={<TabBarPlaceholder color={ComponentColors.BACKGROUND_COLOR}/>}
                    ListHeaderComponent={this.props.headerComponent}
                />
                }
            </View>
        );
    }
}

const ActionButtons = (openExplore: () => void, openAddChannel: () => void) => (
    <TwoButton
        leftButton={{
            label: 'Add channel',
            icon: <Icon name='plus-box' size={24} color={Colors.BRAND_PURPLE} />,
            onPress: openAddChannel,
        }}
        rightButton={{
            label: 'Explore',
            icon: <Icon name='compass' size={24} color={Colors.BRAND_PURPLE}/>,
            onPress: openExplore,
        }}
    />
);

export const PublicChannelsListView = (props: DispatchProps & StateProps) => (
    <FragmentSafeAreaViewWithoutTabBar>
        <FeedGrid
            headerComponent={props.showExplore
                ? ActionButtons(props.openExplore, () => props.navigation.navigate('FeedLinkReader', {}))
                : undefined
            }
            {...props}
        >
            <NavigationHeader
                navigation={props.navigation}
                title={props.title}
                rightButton1={{
                    label: <Icon name='settings' size={24} color={ComponentColors.NAVIGATION_BUTTON_COLOR} />,
                    onPress: () => props.navigation.navigate('Settings', {}),
                }}
            />
        </FeedGrid>
    </FragmentSafeAreaViewWithoutTabBar>
);

const styles = StyleSheet.create({
    sectionHeader: {
        paddingHorizontal: 10,
        paddingTop: 20,
        paddingBottom: 7,
        color: Colors.DARK_GRAY,
        backgroundColor: ComponentColors.BACKGROUND_COLOR,
        fontSize: 14,
    },
});
