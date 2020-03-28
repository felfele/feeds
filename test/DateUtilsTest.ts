import { timestampToDateString, printableElapsedTime } from '../src/helpers/dateHelpers';

const now = 1503058728706;

test('Test UTC timestamp to ISO8601 complete format', async () => {
    const input = 1502982086000;
    const result = timestampToDateString(input);

    expect(result).toEqual('2017-08-17T15:01:26.000Z');
});

test('Test printable time output', () => {
    const createdTimes = [
        1503058235000,
        1503057385000,
        1503056192000,
        1503053712000,
        1502453928706,
        1500380328706,
    ];
    const expectedResults = [
        '8 minutes',
        '22 minutes',
        '42 minutes',
        '1 hour',
        '1 week',
        '1 month',
    ];

    const results = createdTimes.map(time => printableElapsedTime(time, now));

    expect(results).toEqual(expectedResults);
});
