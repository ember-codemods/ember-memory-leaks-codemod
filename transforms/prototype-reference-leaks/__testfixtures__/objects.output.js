export default Ember.Service.extend({
  init: function() {
    this._super(...arguments);
    this._data = Object.create(null);
  }
});
