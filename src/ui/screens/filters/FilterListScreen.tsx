import * as React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { ContentFilter } from '../../../models/ContentFilter';
import { DateUtils } from '../../../DateUtils';
import { NavigationHeader } from '../../misc/NavigationHeader';
import { ComponentColors } from '../../../styles';
import { RowItem } from '../../buttons/RowButton';
import { TypedNavigation } from '../../../helpers/navigation';
import { FragmentSafeAreaViewWithoutTabBar } from '../../misc/FragmentSafeAreaView';

export interface StateProps {
    navigation: TypedNavigation;
    filters: ContentFilter[];
}

export interface DispatchProps {

}

export class FilterListScreen extends React.Component<StateProps & DispatchProps, any> {
    public render() {
        return (
            <FragmentSafeAreaViewWithoutTabBar>
                <NavigationHeader
                    title='Mute keywords'
                    navigation={this.props.navigation}
                    rightButton1={{
                        onPress: this.onAddFilter,
                        label: <MaterialIcon name='add-box' size={24} color={ComponentColors.NAVIGATION_BUTTON_COLOR} />,
                    }}
                />
                <ScrollView style={{ backgroundColor: ComponentColors.BACKGROUND_COLOR }}>
                    {this.props.filters.map(filter => (
                        <RowItem
                            title={filter.text}
                            description={
                                'Expires in ' +
                                DateUtils.printableElapsedTime(Date.now(), filter.createdAt + filter.validUntil)}
                            key={filter.text}
                            buttonStyle='navigate'
                            onPress={() => {
                                this.editFilter(filter);
                            }}
                        />
                    ))}
                </ScrollView>
            </FragmentSafeAreaViewWithoutTabBar>
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
});
