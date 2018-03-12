Occasion.Modules.push(function(library) {
  library.Customer = class Customer extends library.Base {
    ahoyEmailChanged() {
      var customer = this;
      var host = (options.baseUrl || Occasion.baseUrl).match(/\w+:\/\/[^\/]+/)[0];
      axios.post(`${host}/p/ahoy_identify`, {
        email: customer.email,
        merchant_token: Occasion.token
      });
    }
  };

  library.Customer.className = 'Customer';
  library.Customer.queryName = 'customers';

  library.Customer.attributes('email', 'firstName', 'lastName', 'zip');

  library.Customer.hasMany('orders', { inverseOf: 'customer' });

  library.Customer.afterBuild(function() {
    var lastEmail = null;
    var watchEmail = _.bind(function() {
      if(lastEmail != this.email) {
        _.bind(this.ahoyEmailChanged, this)();
        lastEmail = this.email;
      }

      setTimeout(watchEmail, 500);
    }, this);

    setTimeout(watchEmail, 500);
  });
});
