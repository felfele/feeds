import { ContentFilter } from '../models/ContentFilter';
import { Feed } from '../models/Feed';
import { SubCategoryMap } from '../models/recommendation/NewsSource';
import { LocalFeed } from '../social/api';
import { Post } from '../models/Post';
import { MutualContact } from '../models/Contact';
import { ContactFeed } from '../models/ContactFeed';
import { NavigationNavigateAction } from 'react-navigation';
import { InviteCode } from '../models/InviteCode';
import { ContactHelper } from './contactHelpers';

export interface Routes {
    App: {};
    Root: {};
    Settings: {};
    BugReportView: {};
    SwarmSettingsContainer: {};
    FilterListEditorContainer: {};
    Backup: {};
    Restore: {};
    BackupRestore: {};
    LogViewer: {};
    Debug: {};
    PublicChannelsListContainer: {
        showExplore: boolean,
        feeds?: Feed[],
    };
    Feed: {
        feedUrl: string,
        name: string,
    };
    FeedInfo: {
        feed: Feed;
    };
    FeedLinkReader: {
    };
    RSSFeedLoader: {
        feedUrl: string;
    };
    RSSFeedInfo: {
        feed: Feed;
    };
    EditFilter: {
        filter: ContentFilter,
    };
    FeedFromList: {
        feedUrl: string,
        name: string,
    };
    CategoriesContainer: {
    };
    SubCategoriesContainer: {
        title: string,
        subCategories: SubCategoryMap<Feed>,
    };
    NewsSourceFeed: {
        feed: Feed,
    };
    NewsSourceGridContainer: {
        feeds: Feed[],
        subCategoryName: string,
    };
}

export interface TypedNavigation {
    goBack: <K extends keyof Routes>(routeKey?: K | null) => boolean;
    navigate: <K extends keyof Routes>(routeKey: K, params: Routes[K]) => boolean;
    replace: <K extends keyof Routes>(routeKey: K, params: Routes[K], action?: NavigationNavigateAction) => boolean;
    pop: (n?: number, params?: { immediate?: boolean }) => boolean;
    popToTop: () => void;
    getParam: <K extends keyof Routes, P extends keyof Routes[K]>(param: P) => Routes[K][P];
    setParams: <K extends keyof Routes>(newParams: Routes[K]) => boolean;
}
