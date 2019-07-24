import { connect } from 'react-redux';
import { AppState } from '../reducers/AppState';
import { AsyncActions } from '../actions/asyncActions';
import { StateProps, DispatchProps, PostEditor } from '../components/PostEditor';
import { Post } from '../models/Post';
import { TypedNavigation } from '../helpers/navigation';
import { Actions } from '../actions/Actions';

const mapStateToProps = (state: AppState, ownProps: { navigation: TypedNavigation }): StateProps => {
    return {
        name: state.author.name,
        avatar: state.author.image,
        goBack: ownProps.navigation.goBack,
        draft: state.draft,
        gatewayAddress: state.settings.swarmGatewayAddress,
   };
};

export const mapDispatchToProps = (dispatch: any): DispatchProps => {
   return {
       onPost: (post: Post) => {
            dispatch(AsyncActions.createPost(post));
       },
       onSaveDraft: (draft: Post) => {
           dispatch(Actions.addDraft(draft));
       },
       onDeleteDraft: () => {
           dispatch(Actions.removeDraft());
       },
   };
};

export const PostEditorContainer = connect(
   mapStateToProps,
   mapDispatchToProps,
)(PostEditor);
