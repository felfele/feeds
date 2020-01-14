import { PersistedState } from 'redux-persist';
import { Debug } from '../Debug';
import { ContentFilter } from '../models/ContentFilter';
import { Feed } from '../models/Feed';
import { Post, PrivatePost } from '../models/Post';
import { Settings } from '../models/Settings';

export type PostListDict = {[key: string]: PrivatePost[]};

export interface AppStateV0 extends PersistedState {
    contentFilters: ContentFilter[];
    feeds: Feed[];
    settings: Settings;
    currentTimestamp: number;
    rssPosts: Post[];
}

export const migrateUnversionedToVersion0 = (state: PersistedState): AppStateV0 => {
    Debug.log('Migrate unversioned to version 0');
    const appState = state as any;
    const version0AppState = {
        ...appState,
    };
    return version0AppState;
};
