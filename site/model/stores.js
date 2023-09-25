const allSpacesRegex = / /g;

exports.stores = {
    spar: {
        name: "Spar",
        budgetBrands: ["s-budget"],
        color: "green",
        defaultChecked: true,
        getUrl: (item) => `https://www.interspar.at/shop/lebensmittel/p/${item.id}`,
    },
};

exports.STORE_KEYS = Object.keys(exports.stores);
exports.BUDGET_BRANDS = [...new Set([].concat(...Object.values(exports.stores).map((store) => store.budgetBrands)))];
