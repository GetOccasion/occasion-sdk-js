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
* Increase page size of questions loaded in `Order.construct` to 500
* Set `answer.option` to default option for `drop_down` and `option_list` questions in `Order.construct`
* Set `answer.value` to `min` for `spin_button` questions in `Order.construct`
* Add afterRequest callback to transform `product.attendeeQuestions` to `ActiveResource.Collection` with camelized values
* Add order afterRequest for matching attendee collection size to order quantity
* Add attributes for `Attendee` resource
* Add `Product#constructCalendar` for loading months of timeSlots with `nextPage()` and `prevPage()` support
* Auto-select `order.timeSlots` in `Order.construct` when `!product.requiresTimeSlotSelection`
* Add TimeSlot belongsTo order relationship
* Use strictAttributes mode, meaning that only attributes defined by the SDK will be returned by attributes()
* Wrap Order price-related attributes in Decimal.js objects
* Rebalance changed outstandingBalance across gift card and other payment transactions
