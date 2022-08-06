import { fetchFeedsFromUrl } from '../../src/helpers/feedHelpers'

describe('fetchFeedsFromUrl', () => {
    const failingFetchConfiguration = {
        fetchContentResult: () => Promise.resolve(null),
        fetchFeedByContentWithMimeType: () => Promise.resolve(null),
        parseOPML: () => Promise.resolve(undefined),
    }

    it('from user input', async () => {
        const userInput = 'espn'
        const result = await fetchFeedsFromUrl(userInput, failingFetchConfiguration)

        expect(result).toBeDefined()
    })

    it('from user input with multiple words', async () => {
        const userInput = 'the verge'
        const result = await fetchFeedsFromUrl(userInput, failingFetchConfiguration)

        expect(result).toBeDefined()
    })

    it('from user input nonexisting', async () => {
        const userInput = 'a'
        const result = await fetchFeedsFromUrl(userInput, failingFetchConfiguration)

        expect(result).toBeUndefined()
    })

})
