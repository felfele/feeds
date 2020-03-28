import * as React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { ContentFilter } from '../../../models/ContentFilter';
import { printableElapsedTime } from '../../../helpers/dateHelpers';
import { NavigationHeader } from '../../misc/NavigationHeader';
import { ComponentColors, Colors } from '../../../styles';
import { RowItem } from '../../buttons/RowButton';
import { TypedNavigation } from '../../../helpers/navigation';
import { FragmentSafeAreaView } from '../../misc/FragmentSafeAreaView';
import { BoldText, RegularText } from '../../misc/text';
import { WideButton } from '../../buttons/WideButton';

const AddWordIcon = (props: {color: string}) => <MaterialIcon name='add-box' size={24} color={props.color} />;

export interface StateProps {
    navigation: TypedNavigation;
    filters: ContentFilter[];
}

export interface DispatchProps {

}

export class FilterListScreen extends React.Component<StateProps & DispatchProps, any> {
    public render() {
        return (
            <FragmentSafeAreaView>
                <NavigationHeader
                    title='Muted words'
                    navigation={this.props.navigation}
                    rightButton1={{
                        onPress: this.onAddFilter,
                        label: <AddWordIcon color={ComponentColors.NAVIGATION_BUTTON_COLOR} />,
                    }}
                />
                <ScrollView style={{ backgroundColor: ComponentColors.BACKGROUND_COLOR }}>
                    {this.props.filters.length === 0 &&
                        <View style={styles.emptyContainer}>
                            <BoldText style={styles.emptyListTitle}>You aren't muting any words.</BoldText>
                            <RegularText style={styles.emptyListText}>When you mute words, you won't see new posts that include them for the specified time.</RegularText>
                            <WideButton
                                label='Add word'
                                icon={<AddWordIcon color={ComponentColors.BUTTON_COLOR} />}
                                onPress={this.onAddFilter}
                            />
                        </View>
                    }
                    {this.props.filters.map(filter => (
                        <RowItem
                            title={filter.text}
                            description={
                                'Expires in ' +
                                printableElapsedTime(Date.now(), filter.createdAt + filter.validUntil)}
                            key={filter.text}
                            buttonStyle='navigate'
                            onPress={() => {
                                this.editFilter(filter);
                            }}
                        />
                    ))}
                </ScrollView>
            </FragmentSafeAreaView>
        );
    }

    private editFilter = (filter: ContentFilter) => {
        this.props.navigation.navigate('EditFilter', { filter: filter });
    }

    private onAddFilter = () => {
        const filter: ContentFilter = {
            text: '',
            createdAt: 0,
            validUntil: 0,
        };
        this.props.navigation.navigate('EditFilter', { filter: filter });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    emptyContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 20,
    },
    emptyListTitle: {
        color: ComponentColors.STRONG_TEXT,
    },
    emptyListText: {
        paddingVertical: 20,
        paddingHorizontal: 10,
        color: ComponentColors.HINT_TEXT_COLOR,
    },
});
