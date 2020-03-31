import * as React from 'react';
import { StyleSheet, SafeAreaView, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SectionGrid } from 'react-native-super-grid';

import { Feed } from '../../../models/Feed';
import { Colors, ComponentColors } from '../../../styles';
import { NavigationHeader } from '../../misc/NavigationHeader';
import { GridCard, getGridCardSize } from '../../../ui/misc/GridCard';
import { MediumText } from '../../../ui/misc/text';
import { TabBarPlaceholder } from '../../../ui/misc/TabBarPlaceholder';
import { defaultImages } from '../../../defaultImages';
import { TypedNavigation } from '../../../helpers/navigation';
import { FragmentSafeAreaView } from '../../../ui/misc/FragmentSafeAreaView';
import { TwoButton } from '../../../ui/buttons/TwoButton';
import { getFeedImage } from '../../../helpers/feedHelpers';

export interface DispatchProps {
    onPressFeed: (feed: Feed) => void;
    openExplore: () => void;
}

export interface PublicFeedSection {
    title: string;
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

class FeedGrid extends React.PureComponent<DispatchProps & StateProps & { children?: React.ReactNode}> {
    public render() {
        const itemDimension = getGridCardSize();
        return (
            <View style={{ backgroundColor: ComponentColors.BACKGROUND_COLOR, flex: 1 }}>
                {this.props.children}
                {
                <SectionGrid
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
                                isSelected={false}
                            />
                        );
                    }}
                    renderSectionHeader={({ section }) => ( section.title &&
                        <MediumText style={styles.sectionHeader}>{section.title}</MediumText>
                    )}
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
            label: 'Explore',
            icon: <Icon name='compass' size={24} color={Colors.BRAND_PURPLE}/>,
            onPress: openExplore,
        }}
        rightButton={{
            label: 'Add feed',
            icon: <Icon name='plus-box' size={24} color={Colors.BRAND_PURPLE} />,
            onPress: openAddChannel,
        }}
    />
);

export const PublicChannelsListView = (props: DispatchProps & StateProps) => (
    <FragmentSafeAreaView>
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
    </FragmentSafeAreaView>
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
