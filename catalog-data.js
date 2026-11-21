(function (root) {
  // The only price snapshot used by the sales experience. Prices are reference-demo
  // values, never live branch prices. Product identity remains in products.json.
  const priceReference = {
    '10071316': 1199000, '10088710': 5099000, '10166359': 109000,
    '10171076': 25000, '10176575': 179000, '10209143': 839000,
    '10242354': 119000, '10410874': 200000, '10441940': 2099300,
    '10443321': 159000, '10464185': 699000, '10467781': 879000,
    '10475501': 1699000, '10475503': 1799000, '10495549': 6000000,
    '10495950': 9500000, '10565166': 299000, '10568713': null,
    '10580040': 429000, '10580757': 199000, '10601785': 999000,
    '10617982': 8999000, '10624948': 1049000, '10627869': 1000000,
    '10627871': 1500000, '10628207': 89000, '10664228': 1463000,
    '10680529': 6999000, '10701444': 2999000, '10705636': 1699000
  };
  const data = { priceReference };
  if (typeof module !== 'undefined') module.exports = data;
  root.INFORMA_CATALOG = data;
})(typeof window !== 'undefined' ? window : globalThis);
