# prototype-reference-leaks
Prototype reference leaks are memory leaks that occur because state is stored via a reference on a class' prototype.

[Prototype Reference leaks](https://github.com/ember-best-practices/memory-leak-examples/blob/master/exercises/exercise-1.md)


## Usage

```
npx ember-memory-leaks-codemod prototype-reference-leaks path/of/files/ or/some**/*glob.js

# or

yarn global add ember-memory-leaks-codemod
ember-memory-leaks-codemod prototype-reference-leaks path/of/files/ or/some**/*glob.js
```

## Input / Output

```js
// app/services/shared-storage.js
export default Ember.Service.extend({
  _data: Object.create(null)
});

```

```js
export default Ember.Service.extend({
  init() {
    this._super(...arguments);
    this._data = Object.create(null);
  }
});
```

