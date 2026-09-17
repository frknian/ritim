import { registerHooks } from 'node:module';

// expo-sqlite -> node:sqlite tabanlı test mock'u.
// (TypeScript dönüşümü ayrı bir --import tsx/esm bayrağıyla sağlanır, bkz. package.json)
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'expo-sqlite') {
      return nextResolve(new URL('./expo-sqlite-mock.mjs', import.meta.url).href, context);
    }
    return nextResolve(specifier, context);
  },
});
