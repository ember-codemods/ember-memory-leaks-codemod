# callback-leaks
Callback leaks are memory leaks that occur due to state being caught in a callback function that is never released from memory.

Read more on callback leaks [here](https://github.com/ember-best-practices/memory-leak-examples/blob/master/exercises/exercise-2.md)


## Usage

```
npx ember-memory-leaks-codemod callback-leaks path/of/files/ or/some**/*glob.js

# or

yarn global add ember-memory-leaks-codemod
ember-memory-leaks-codemod callback-leaks path/of/files/ or/some**/*glob.js
```

## Input 

```js
export default Ember.Component.extend({
  didInsertElement() {
    if (this.get('onScroll')) {
      window.addEventListener('scroll', (...args) => this.get('onScroll')(...args));
    }
  }
});
```

## Output


```js
export default Ember.Component.extend({
  didInsertElement() {
    if (this.get('onScroll')) {
      this._onScrollHandler = (...args) => this.get('onScroll')(...args);
      window.addEventListener('scroll', this._onScrollHandler);
    }
  },

  willDestroy() {
    window.removeEventListener('scroll', this._onScrollHandler);
  }
});
```
