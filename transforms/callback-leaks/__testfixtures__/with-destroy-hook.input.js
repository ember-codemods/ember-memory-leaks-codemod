import Component from '@ember/component';

export default Component.extend({
  didInsertElement() {
    if (this.get('onScroll')) {
      window.addEventListener('scroll', (...args) => this.get('onScroll')(...args));
    }
  },

  willDestroyElement() {
    this._super(...arguments);
  }

});
