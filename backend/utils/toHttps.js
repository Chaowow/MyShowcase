function toHttps(url) {
    if (typeof url !== 'string') return url;
    if (url.startsWith('https://')) return url;
    if (url.startsWith('http://')) {
        return 'https://' + url.slice(7);
    }
    return url;
};

function normalizeGoogleBook(book = {}) {
    const volumeInfo = book.volumeInfo || {};
    const imageLinks = volumeInfo.imageLinks || {};

    return {
        ...book,
        volumeInfo: {
            ...volumeInfo,
            infoLink: toHttps(volumeInfo.infoLink),
            previewLink: toHttps(volumeInfo.previewLink),
            canonicalVolumeLink: toHttps(volumeInfo.canonicalVolumeLink),
            imageLinks: {
                ...imageLinks,
                smallThumbnail: toHttps(imageLinks.smallThumbnail),
                thumbnail: toHttps(imageLinks.thumbnail),
            }
        }
    };
};

module.exports = { toHttps, normalizeGoogleBook};