const { test } = require('node:test');
const assert = require('node:assert/strict');
const { dictionaries, resolveLocale, detectMessageLocale, text, label } = require('../i18n.js');

const saved = value => ({ getItem: () => value });

test('message language detection handles merged words, shorthand, and neutral input',()=>{
  assert.equal(detectMessageLocale('Aku carimperabotan dapur','en'),'id');
  assert.equal(detectMessageLocale('cr yg murah, brp?','en'),'id');
  assert.equal(detectMessageLocale('dsk plz','id'),'en');
  assert.equal(detectMessageLocale('I need a kitchen table','id'),'en');
  assert.equal(detectMessageLocale('10701444','id'),'id');
});

test('English is the default when no valid preference exists', () => {
  assert.equal(resolveLocale(), 'en');
  assert.equal(resolveLocale('?lang=fr', saved('ja')), 'en');
  assert.equal(resolveLocale('?lang=', { getItem() { throw new Error('blocked'); } }), 'en');
});

test('valid query parameters take priority over a saved preference', () => {
  assert.equal(resolveLocale('?lang=en', saved('id')), 'en');
  assert.equal(resolveLocale('?lang=id', saved('en')), 'id');
});

test('the saved locale is used when the query language is absent or invalid', () => {
  assert.equal(resolveLocale('', saved('id')), 'id');
  assert.equal(resolveLocale('?lang=xx', saved('id')), 'id');
});

test('both dictionaries cover the same keys and preserve interpolation fields', () => {
  assert.deepEqual(Object.keys(dictionaries.en), Object.keys(dictionaries.id));
  const fields = value => [...value.matchAll(/\{\w+\}/g)].map(match => match[0]).sort();
  for (const key of Object.keys(dictionaries.en)) {
    assert.ok(dictionaries.en[key].trim(), key);
    assert.deepEqual(fields(dictionaries.en[key]), fields(dictionaries.id[key]), key);
  }
  assert.equal(text('{count} produk', { count: 2 }), '2 products');
  assert.equal(text('{count} produk', { count: 1 }), '1 product');
  assert.ok(label('Tambahkan {name}', { name: '<item>' }).includes('Add &lt;item&gt;'));
});
