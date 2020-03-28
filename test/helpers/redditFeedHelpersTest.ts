import { makeCanonicalRedditLink } from '../../src/helpers/redditFeedHelpers';

describe('Make canonical reddit link from any reddit link', () => {
    it('should work with all possible versions', () => {
        const inputs = [
            'reddit.com/r/memes',
            'reddit.com/r/memes/',
            'http://reddit.com/r/memes',
            'https://reddit.com/r/memes',
            'https://reddit.com/r/memes.rss',
            'https://wwww.reddit.com/r/memes',
            'https://www.reddit.com/r/memes/comments/fpvti0/thats_how_it_all_happened/',
        ];
        const expected = [
            'https://reddit.com/r/memes',
            'https://reddit.com/r/memes',
            'https://reddit.com/r/memes',
            'https://reddit.com/r/memes',
            'https://reddit.com/r/memes',
            'https://reddit.com/r/memes',
            'https://reddit.com/r/memes',
        ];

        const result = inputs.map(input => makeCanonicalRedditLink(input)?.canonicalUrl);

        expect(result).toEqual(expected);
    });
});
