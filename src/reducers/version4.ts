import { PersistedState } from 'redux-persist';
import { Debug } from '../Debug';
import { ContentFilter } from '../models/ContentFilter';
import { Feed } from '../models/Feed';
import { Post, PrivatePost } from '../models/Post';
import { Settings } from '../models/Settings';
import { AppStateV3 } from './version3';
import { makeEmptyPrivateChannel } from '../protocols/privateChannel';

export type PostListDict = {[key: string]: PrivatePost[]};

export interface AppStateV4 extends PersistedState {
    contentFilters: ContentFilter[];
    feeds: Feed[];
    settings: Settings;
    currentTimestamp: number;
    rssPosts: Post[];
}

export const migrateVersion3ToVersion4 = (state: PersistedState): AppStateV4 => {
    Debug.log('Migrate version 3 to version 4');
    const appStateV3 = state as AppStateV3;
    const appStateV4 = {
        ...appStateV3,
        lastEditingApp: null,
        privatePosts: {},
        contacts: appStateV3.contacts.map(contact => contact.type === 'mutual-contact'
            ? {
                ...contact,
                privateChannel: makeEmptyPrivateChannel(),
            }
            : contact
        ),
    };
    return appStateV4;
};
