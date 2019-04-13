export default Ember.Service.extend({
  init() {
    this._super(...arguments);
    this._data = Object.create(null);
  }
});
