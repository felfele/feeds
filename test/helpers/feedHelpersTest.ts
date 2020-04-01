import { fetchFeedsFromUrl } from '../../src/helpers/feedHelpers';

describe('fetchFeedsFromUrl', () => {
    const failingFetchConfiguration = {
        fetchContentWithMimeType: () => Promise.resolve(null),
        fetchFeedByContentWithMimeType: () => Promise.resolve(null),
        fetchOPML: () => Promise.resolve(undefined),
    };

    it('from user input', async () => {
        const userInput = 'espn';
        const result = await fetchFeedsFromUrl(userInput, failingFetchConfiguration);

        expect(result).toBeDefined();
    });

    it('from user input with multiple words', async () => {
        const userInput = 'the verge';
        const result = await fetchFeedsFromUrl(userInput, failingFetchConfiguration);

        expect(result).toBeDefined();
    });

    it('from user input nonexisting', async () => {
        const userInput = 'a';
        const result = await fetchFeedsFromUrl(userInput, failingFetchConfiguration);

        expect(result).toBeUndefined();
    });

});
