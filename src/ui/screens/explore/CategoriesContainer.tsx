import { connect } from 'react-redux'
import { StateProps, CategoriesScreen } from './CategoriesScreen'
import { AppState } from '../../../reducers/AppState'
import { exploreData, SubCategoryMap } from '../../../models/recommendation/NewsSource'
import { TypedNavigation } from '../../../helpers/navigation'
import { Feed } from '../../../models/Feed'

const mapStateToProps = (state: AppState, ownProps: { navigation: TypedNavigation }): StateProps => {
    const categories = Object.keys(exploreData)
    return {
        categories,
        navigation: ownProps.navigation,
    }
}

export const CategoriesContainer = connect(mapStateToProps)(CategoriesScreen)
