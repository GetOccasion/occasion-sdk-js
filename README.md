# The Occasion Javascript SDK

The Occasion Javascript SDK enables you to sell bookings simply and securely through your web application, providing services to help you make use of many of the resources of Occasion. Such resources include merchants, products, venues, customers, orders, coupons, gift cards, payment methods, and calendars.

## Installation

```javascript
yarn add occasion-sdk
```

You can also use the CDN address https://unpkg.com/occasion-sdk to add it to your AMD loader or into your page:

```html
<script type='text/javascript' src='https://unpkg.com/occasion-sdk'></script>
```

## Initialization

Once you’ve added `occasion-sdk` to your application, initialize it with your public API token,
which can be found in your account settings on Occasion.

```javascript
let OccasionClient = new Occasion.Client(token: '[API_TOKEN]');
```

## Resources

* [Getting Started Guide](http://docs.getoccasion.com/sdk/)
  * Learn much of the DSL as this guide demonstrates how to create an order widget for any product on Occasion, so you can sell bookings for that product to customers.
