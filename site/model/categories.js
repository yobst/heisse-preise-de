exports.categories = [
    {
        name: "Unbekannt",
        subcategories: [/*A0*/ "Unbekannt"],
    },
];

exports.categories.forEach((category, index) => (category.index = index));

exports.toCategoryCode = (i, j) => {
    return (
        (i < 10 ? "" + i : String.fromCharCode("A".charCodeAt(0) + (i - 10))) + (j < 10 ? "" + j : String.fromCharCode("A".charCodeAt(0) + (j - 10)))
    );
};

exports.fromCategoryCode = (code) => {
    if (!code || code.length != 2) return [exports.categories.length - 1, 0];
    const codeI = code.charCodeAt(0);
    const codeJ = code.charCodeAt(1);
    return [
        codeI - (codeI < "A".charCodeAt(0) ? "0".charCodeAt(0) : "A".charCodeAt(0) - 10),
        codeJ - (codeJ < "A".charCodeAt(0) ? "0".charCodeAt(0) : "A".charCodeAt(0) - 10),
    ];
};

exports.UNKNOWN_CATEGORY = exports.toCategoryCode(exports.categories.length - 1, 0);
