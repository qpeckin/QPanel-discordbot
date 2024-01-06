function padRight(text, paddingSize) {
    const padding = " ".repeat(paddingSize);
    return padding + text;
}

module.exports = padRight;