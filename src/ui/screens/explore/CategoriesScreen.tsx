import * as React from 'react';
import { StyleSheet, ScrollView, SafeAreaView, View } from 'react-native';
import { Colors, ComponentColors } from '../../../styles';
import { RegularText } from '../../misc/text';
import { CategoryMap, SubCategoryMap } from '../../../models/recommendation/NewsSource';
import { NavigationHeader } from '../../misc/NavigationHeader';
import { RowItem } from '../../buttons/RowButton';
import { TypedNavigation } from '../../../helpers/navigation';
import { FragmentSafeAreaView } from '../../misc/FragmentSafeAreaView';
import { Feed } from '../../../models/Feed';
import { TabBarPlaceholder } from '../../misc/TabBarPlaceholder';

const CATEGORIES_LABEL = 'CATEGORIES';

export interface StateProps {
    categories: string[];
    navigation: TypedNavigation;
}

export interface DispatchProps { }

export const CategoriesScreen = (props: StateProps & DispatchProps) => {
    const categories = props.categories.map((categoryName: string) => {
        return (
            <RowItem
                key={categoryName}
                title={categoryName}
                buttonStyle='navigate'
                onPress={() => {
                    // props.navigation.navigate('SubCategoriesContainer', {
                    //     title: categoryName,
                    //     subCategories: props.categories[categoryName],
                    // });
                        props.navigation.navigate('NewsSourceGridContainer', {
                            // feeds: props.categories[categoryName],
                            // subCategoryName: categoryName,
                            categoryName,
                        });
                }}
            />
        );
    });
    return (
        <FragmentSafeAreaView>
            <View style={{flex: 1}}>
                <NavigationHeader navigation={props.navigation} title='Explore'/>
                <ScrollView style={{ backgroundColor: ComponentColors.BACKGROUND_COLOR, paddingTop: 10 }}>
                    {categories}
                    <TabBarPlaceholder/>
                </ScrollView>
            </View>
        </FragmentSafeAreaView>
    );
};

const styles = StyleSheet.create({
    label: {
        paddingHorizontal: 10,
        paddingTop: 20,
        paddingBottom: 7,
        color: Colors.GRAY,
    },
});
