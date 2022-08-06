import * as urlUtils from '../../src/helpers/urlUtils'

test('Test invalid human hostname', async () => {
    const input = ''
    const expectedResult = ''
    const result = urlUtils.getHumanHostname(input)

    expect(result).toBe(expectedResult)
})

test('Test human hostname', async () => {
    const input = 'https://reddit.com/r/android'
    const expectedResult = 'reddit.com'
    const result = urlUtils.getHumanHostname(input)

    expect(result).toBe(expectedResult)
})

test('Test human hostname without domain', async () => {
    const input = 'https://reddit/r/android'
    const expectedResult = 'reddit'
    const result = urlUtils.getHumanHostname(input)

    expect(result).toBe(expectedResult)
})

test('Test human hostname with long name', async () => {
    const input = 'https://www.gfdl.noaa.gov/global-warming-and-hurricanes/'
    const expectedResult = 'noaa.gov'
    const result = urlUtils.getHumanHostname(input)

    expect(result).toBe(expectedResult)
})

test('Test human hostname with numeric address', async () => {
    const input = 'http://192.168.1.49:2368/untitled-15/'
    const expectedResult = '1.49'
    const result = urlUtils.getHumanHostname(input)

    expect(result).toBe(expectedResult)
})

test('Test base url', async () => {
    const input = 'https://www.gfdl.noaa.gov/global-warming-and-hurricanes/'
    const expectedResult = 'https://www.gfdl.noaa.gov/'
    const result = urlUtils.getBaseUrl(input)

    expect(result).toBe(expectedResult)
})

test('Test base url without protocol', async () => {
    const input = '//www.gfdl.noaa.gov/global-warming-and-hurricanes/'
    const expectedResult = 'https://www.gfdl.noaa.gov/'
    const result = urlUtils.getBaseUrl(input)

    expect(result).toBe(expectedResult)
})

test('Test url creation from urn', async () => {
    const baseUrl = 'https://www.gfdl.noaa.gov/'
    const urn = '/global-warming-and-hurricanes/'
    const expectedResult = 'https://www.gfdl.noaa.gov/global-warming-and-hurricanes/'
    const result = urlUtils.createUrlFromUrn(urn, baseUrl)

    expect(result).toBe(expectedResult)
})

test('Test url creation from urn without trailing slash', async () => {
    const baseUrl = 'https://www.gfdl.noaa.gov/'
    const urn = 'global-warming-and-hurricanes/'
    const expectedResult = 'https://www.gfdl.noaa.gov/global-warming-and-hurricanes/'
    const result = urlUtils.createUrlFromUrn(urn, baseUrl)

    expect(result).toBe(expectedResult)
})

test('Test url creation from urn without ending and trailing slash', async () => {
    const baseUrl = 'https://www.gfdl.noaa.gov'
    const urn = 'global-warming-and-hurricanes/'
    const expectedResult = 'https://www.gfdl.noaa.gov/global-warming-and-hurricanes/'
    const result = urlUtils.createUrlFromUrn(urn, baseUrl)

    expect(result).toBe(expectedResult)
})

test('Test canonical url', () => {
    const inputs = ['example.com', '//example.com', 'https://example.com', 'https://example.com/', 'https://example.com?abc=bcd']
    const expectedResult = 'https://example.com/'

    for (const input of inputs) {
        const result = urlUtils.getCanonicalUrl(input)
        expect(result).toBe(expectedResult)
    }
})

test('Test canonical url with path', () => {
    const inputs = ['example.com/1', '//example.com/1', 'https://example.com/1', 'https://example.com/1?abc=bcd']
    const expectedResult = 'https://example.com/1'

    for (const input of inputs) {
        const result = urlUtils.getCanonicalUrl(input)
        expect(result).toBe(expectedResult)
    }
})

test('Test canonical with empty url', () => {
    const input = ''
    const expectedResult = ''

    const result = urlUtils.getCanonicalUrl(input)
    expect(result).toBe(expectedResult)
})

test('Test getLinkFromText with https link without trailing slash', () => {
    const link = 'https://swarm-gateways.net'
    const input = `Lorem ipsum ${link}`
    const result = urlUtils.getLinkFromText(input)

    expect(result).toBe(link)
})

test('Test getLinkFromText with https link', () => {
    const link = 'https://swarm-gateways.net/'
    const input = `Lorem ipsum ${link}`
    const result = urlUtils.getLinkFromText(input)

    expect(result).toBe(link)
})

test('Test getLinkFromText with https link in a sentence', () => {
    const link = 'https://swarm-gateways.net/'
    const input = `Lorem ipsum ${link} dolor sit amet`
    const result = urlUtils.getLinkFromText(input)

    expect(result).toBe(link)
})

describe('comparing URLs', () => {
    const inputs = ['example.com', 'www.example.com', 'https://example.com/', 'http://example.com/', 'http://example.com', 'https://www.example.com/']

    test('basic comparison', () => {
        const link = 'example.com'
        for (const input of inputs) {
            const result = urlUtils.compareUrls(input, link)
            expect(result).toBeTruthy()
        }
    })
    test('basic comparison with protocol and www', () => {
        const link = 'https://www.example.com/'
        for (const input of inputs) {
            const result = urlUtils.compareUrls(input, link)
            expect(result).toBeTruthy()
        }
    })
})
