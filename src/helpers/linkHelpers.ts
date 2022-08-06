export const FEEDS_LINK_MESSAGE = 'Here is a link to my Felfele Feeds. Copy this message and open the app! '
export const makeFeedsLinkMessage = (link: string) => {
    const message = `${FEEDS_LINK_MESSAGE}${link}`
    return message
}
