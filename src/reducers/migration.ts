import { MigrationManifest } from 'redux-persist';
import { migrateUnversionedToVersion0 } from './version0';
import { currentAppStateVersion } from './AppState';

export const migrateAppState: MigrationManifest = {
    [currentAppStateVersion]: migrateUnversionedToVersion0,
};
