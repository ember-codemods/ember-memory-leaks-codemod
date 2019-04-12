export default Ember.Service.extend({
  init() {
    if (this.get('onScroll')) {
      this._onScrollHandler = (...args) => this.get('onScroll')(...args);
      window.addEventListener('scroll', this._onScrollHandler);
    }
  },

  willDestroy() {
    window.removeEventListener("scroll", this._onScrollHandler);
    this._super(...arguments);
  }
});
