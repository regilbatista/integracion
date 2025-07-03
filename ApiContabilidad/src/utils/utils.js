const verifyNull = (obj) => {
    let hasNullValue = { sts: false, key: '' };

    for (const key in obj) {
        if (obj[key] === undefined || obj[key] === null || key.length === 0) {
            hasNullValue = { sts: true, key };
            break;
        }
    }
    return hasNullValue;
}

module.exports = { verifyNull };
