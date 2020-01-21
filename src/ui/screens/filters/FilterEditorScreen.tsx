import * as React from 'react';
import {
    Alert,
    StyleSheet,
    View,
    Text,
    Slider,
    KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { ContentFilter, filterValidUntilToText } from '../../../models/ContentFilter';
import { ComponentColors } from '../../../styles';
import { DAY, MONTH31, WEEK, YEAR } from '../../../DateUtils';
import { SimpleTextInput } from '../../misc/SimpleTextInput';
import { Debug } from '../../../Debug';
import { NavigationHeader } from '../../misc/NavigationHeader';
import { TypedNavigation } from '../../../helpers/navigation';
import { FragmentSafeAreaViewWithoutTabBar } from '../../misc/FragmentSafeAreaView';
import { WideButton } from '../../buttons/WideButton';
import { TwoButton } from '../../buttons/TwoButton';

type SliderValue = 0 | 1 | 2 | 3 | 4 | 5;

const sliderValueToDateDiff = (value: SliderValue): number => {
    switch (value) {
        case 0: return DAY;
        case 1: return WEEK;
        case 2: return 2 * WEEK;
        case 3: return MONTH31;
        case 4: return 3 * MONTH31;
        case 5: return 6 * MONTH31;
    }
};

const sliderValueToText = (value: SliderValue): string => {
    const dateDiff = sliderValueToDateDiff(value);
    return filterValidUntilToText(dateDiff);
};

const filterValidUntilToSliderValue = (dateDiff: number): SliderValue => {
    switch (dateDiff) {
        case DAY: return 0;
        case WEEK: return 1;
        case 2 * WEEK: return 2;
        case MONTH31: return 3;
        case 3 * MONTH31: return 4;
        case 6 * MONTH31: return 5;
        default: return 2;
    }
};

export interface DispatchProps {
    onAddFilter: (filter: ContentFilter) => void;
    onRemoveFilter: (filter: ContentFilter) => void;
}

export interface StateProps {
    filter: ContentFilter;
    navigation: TypedNavigation;
}

type Props = DispatchProps & StateProps;

interface EditFilterState {
    filterText: string;
    filterSliderValue: SliderValue;
}

export class FilterEditorScreen extends React.Component<DispatchProps & StateProps, EditFilterState> {
    constructor(props: Props) {
        super(props);
        this.state = {
            filterText: this.props.filter.text,
            filterSliderValue: filterValidUntilToSliderValue(this.props.filter.validUntil),
        };
    }
    public render() {
        const sliderText = 'Mute until: ' + sliderValueToText(this.state.filterSliderValue);
        const isDelete = this.props.filter.text.length > 0;
        const addOrEditFilter = isDelete
            ? () => {
                this.props.onRemoveFilter(this.props.filter);
                this.onAddFilter();
            }
            : this.onAddFilter
        ;
        const button = isDelete
            ? <TwoButton
                leftButton={{
                    label: 'Edit keyword',
                    icon: <Icon
                        name='edit'
                        size={20}
                        color={ComponentColors.BUTTON_COLOR}
                    />,
                    onPress: addOrEditFilter,
                }}
                rightButton={{
                    label: 'Delete',
                    icon: <Icon
                        name='delete'
                        size={20}
                        color={ComponentColors.WARNING_BUTTON_COLOR}
                    />,
                    onPress: this.onDeleteFilter,
                    fontStyle: { color: ComponentColors.WARNING_BUTTON_COLOR},
                }}
            />
            : <WideButton
                label='Add keyword'
                icon={<Icon
                    name='add-box'
                    size={20}
                    color={ComponentColors.BUTTON_COLOR}
                />}
                onPress={addOrEditFilter}
            />
        ;
        return (
            <FragmentSafeAreaViewWithoutTabBar>
                <NavigationHeader
                    title='Mute keyword'
                    navigation={this.props.navigation}
                />
                <KeyboardAvoidingView style={{flex: 1, backgroundColor: ComponentColors.BACKGROUND_COLOR}}>
                    <SimpleTextInput
                        defaultValue={this.state.filterText}
                        style={styles.linkInput}
                        onChangeText={(text) => this.setState({ filterText: text })}
                        placeholder='Keywords to be muted'
                        autoCapitalize='none'
                        returnKeyType='done'
                        onSubmitEditing={addOrEditFilter}
                        onEndEditing={() => {}}
                        autoFocus={true}
                        autoCorrect={false}
                    />
                    <View style={styles.sliderContainer}>
                        <Text style={styles.sliderText}>{sliderText}</Text>
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={5}
                            step={1}
                            value={this.state.filterSliderValue}
                            onValueChange={(value) => this.setState({ filterSliderValue: value as SliderValue })}
                        />
                    </View>
                    {button}
                </KeyboardAvoidingView>
            </FragmentSafeAreaViewWithoutTabBar>
        );
    }

    private onAddFilter = () => {
        const filter: ContentFilter = {
            text: this.state.filterText,
            validUntil: sliderValueToDateDiff(this.state.filterSliderValue),
            createdAt: Date.now(),
        };
        this.props.onAddFilter(filter);
        this.goBack();
    }

    private goBack = () => {
        this.props.navigation.goBack();
    }

    private onDeleteFilter = () => {
        const options: any[] = [
            { text: 'Yes', onPress: async () => this.deleteFilterAndGoBack() },
            { text: 'Cancel', onPress: () => Debug.log('Cancel Pressed'), style: 'cancel' },
        ];

        Alert.alert('Are you sure you want to delete the keyword?',
            undefined,
            options,
            { cancelable: true },
        );
    }

    private deleteFilterAndGoBack = () => {
        this.props.onRemoveFilter(this.props.filter);
        this.goBack();
    }
}

const styles = StyleSheet.create({
    titleInfo: {
        fontSize: 14,
        color: '#8e8e93',
    },
    linkInput: {
        width: '100%',
        backgroundColor: 'white',
        borderBottomColor: 'lightgray',
        borderBottomWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 8,
        color: 'gray',
        fontSize: 16,
        marginTop: 12,
    },
    deleteButtonContainer: {
        backgroundColor: 'white',
        width: '100%',
        position: 'absolute',
        bottom: 0,
        left: 0,
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    centerIcon: {
        width: '100%',
        justifyContent: 'center',
        flexDirection: 'column',
        height: 40,
        backgroundColor: '#EFEFF4',
        paddingTop: 10,
    },
    sliderContainer: {
        paddingHorizontal: 20,
        flexDirection: 'column',
        height: 80,
    },
    sliderText: {
        flex: 1,
        color: ComponentColors.TEXT_COLOR,
        paddingTop: 20,
    },
    slider: {
        flex: 1,
    },
});
