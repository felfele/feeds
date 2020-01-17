import { connect } from 'react-redux';
import { AppState } from '../../../reducers/AppState';
import { StateProps, FeedView } from './FeedView';
import { mapStateToProps as defaultStateToProps, mapDispatchToProps } from './FeedContainer';
import { TypedNavigation } from '../../../helpers/navigation';

export const mapStateToProps = (state: AppState, ownProps: { navigation: TypedNavigation }): StateProps => {
    return {
        ...defaultStateToProps(state, ownProps),
        onBack: () => {
            ownProps.navigation.goBack(null);
        },
    };
};

export const FeedViewContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
)(FeedView);
