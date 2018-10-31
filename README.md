# domain-snatcher

A simple tool to drop-catch expiring domains.

### Setup

You need to create a `.env` file in the root of the project containing auth variables
(`APP_KEY`, `APP_SECRET`, `CONSUMER_KEY`) generated following OVH's instructions [here](https://github.com/ovh/node-ovh#example-usage)
Also add a `SUBSIDIARY` (list [here](https://eu.api.ovh.com/console/#/order/cart#POST)),
and a `PAYMENT_MEAN` (which needs to be saved in your account), either `creditCard` or `paypal`.

Now just add items to the `domains` variable following this standard:

    {
      name: 'example.io',
      startCheck: '2018-10-29T00:00:00',
      maxPrice: 30
    }

A `maxPrice` is optional. The `startCheck` is the period from where the cron should start
checking the domain for availibility. Try to set this date a little bit before the actual domain
expiration.
