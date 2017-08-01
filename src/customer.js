Occasion.Modules.push(function(library) {
  library.Customer = class Customer extends library.Base {
    signIn(email, password) {
      this.resourceLibrary.interface.request(this.links()['related'] + 'sign_in', 'POST', { email: email, password: password });
    }
  };

  library.Customer.className = 'Customer';
  library.Customer.queryName = 'customers';
});