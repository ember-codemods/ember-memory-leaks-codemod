export default Ember.Component.extend({
  didInsertElement() {
    if (this.get('onScroll')) {
      this._onScrollHandler = (...args) => this.get('onScroll')(...args);
      window.addEventListener('scroll', this._onScrollHandler);
    }
  },

  willDestroyElement() {
    window.removeEventListener("scroll", this._onScrollHandler);
    this._super(...arguments);
  }
});
