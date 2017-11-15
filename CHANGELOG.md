# 0.1.1

* Change client initialization to options object
  * `Occasion.Client({ token: ... })`
  * Allow override of API url with `baseUrl` option
  
# 0.2.0

* Use `Content-Type: 'application/json'`
* Only add answers in `Order.construct` for questions where `category != 'static'`