import { connect } from 'react-redux'
import { StateProps, NewsSourceGridScreen, DispatchProps } from './NewsSourceGridScreen'
import { AppState } from '../../../reducers/AppState'
import { Feed } from '../../../models/Feed'
import { AsyncActions } from '../../../actions/asyncActions'
import { TypedNavigation } from '../../../helpers/navigation'
import { exploreData } from '../../../models/recommendation/NewsSource'

const mapStateToProps = (state: AppState, ownProps: { navigation: TypedNavigation }): StateProps => {
    const categoryName = ownProps.navigation.getParam<'NewsSourceGridContainer', 'categoryName'>('categoryName')
    const feeds = Object
        .entries(exploreData[categoryName])
        .reduce<Feed[]>((prev, curr) => prev.concat(curr[1]), [])
        .sort((a, b) => a.name.localeCompare(b.name))
        .filter((value, index, array) => (index > 0 && value.name === array[index - 1].name) === false)

    return {
        subCategoryName: categoryName,
        feeds,
        navigation: ownProps.navigation,
    }
}

export const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return {
        downloadPostsForNewsSource: (feed: Feed) => {
            dispatch(AsyncActions.downloadPostsFromFeeds([feed]))
        },
    }
}

export const NewsSourceGridContainer = connect(mapStateToProps, mapDispatchToProps)(NewsSourceGridScreen)
