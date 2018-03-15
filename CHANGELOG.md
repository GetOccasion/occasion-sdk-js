# 0.1.1

* Change client initialization to options object
  * `Occasion.Client({ token: ... })`
  * Allow override of API url with `baseUrl` option
  
# 0.2.0

* Use `Content-Type: 'application/json'`
* Only add answers in `Order.construct` for questions where `category != 'static'`

## Master

* Add `Attendee` model and `Order#hasMany('attendees')`
* Add `immutable` option support for active-resource-immutable
* Add `Venue#belongsTo('state')`
* Add `attributes` to common `Order` resources so that their repeated saving can occur
* Use `product.questions().load()` in `Order.construct` so that product questions stay loaded
* Add `inverseOf` for autosaving `Order` relationships
* Add watcher to customer email changes
