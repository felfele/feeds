import BuildConfig from 'react-native-build-config';

export const DEFAULT_BUILD_ENVIRONMENT = '';

export const getBuildEnvironment = (): string => {
    return BuildConfig != null
        ? BuildConfig.BuildEnvironment ?? DEFAULT_BUILD_ENVIRONMENT
        : DEFAULT_BUILD_ENVIRONMENT
    ;
};
