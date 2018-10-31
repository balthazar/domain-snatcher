var schedule = require('node-schedule')

const ovh = require('ovh')({
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_SECRET,
  consumerKey: process.env.CONSUMER_KEY,
})

const deleteCart = cartId => ovh.requestPromised('DELETE', `/order/cart/${cartId}`)

const abortWithMessage = async (cartId, msg) => {
  await deleteCart(cartId)
  return console.log(msg)
}

const main = async (domain, maxPrice) => {
  let cartId = null

  try {
    const cart = await ovh.requestPromised('POST', '/order/cart', {
      ovhSubsidiary: process.env.SUBSIDIARY,
    })

    cartId = cart.cartId

    console.log(`[${domain}] Checking..`)

    await ovh.requestPromised('POST', `/order/cart/${cartId}/assign`)

    const [goldOffer] = await ovh.requestPromised('GET', `/order/cart/${cartId}/domain`, {
      domain,
    })

    if (!goldOffer.orderable) {
      return abortWithMessage(cartId, `[${domain}] Unavailable`)
    }

    const { value: price, text: priceText } = goldOffer.prices[0].price

    console.log(`[${domain}] Available (${priceText})`)

    if (maxPrice && price > maxPrice) {
      return abortWithMessage(cartId, `[${domain}] Too expensive!`)
    }

    const addToCart = await ovh.requestPromised('POST', `/order/cart/${cartId}/domain`, {
      domain,
      offerId: goldOffer.offerId,
    })

    const order = await ovh.requestPromised('POST', `/order/cart/${cartId}/checkout`)

    const payRes = await ovh.requestPromised(
      'GET',
      `/me/order/${order.orderId}/payWithRegisteredPaymentMean`,
      { paymentMean: process.env.PAYMENT_MEAN },
    )

    // console.log(payRes)

    console.log(`[${domain}] Registered!`)
  } catch (err) {
    console.log('[ERROR]', err)

    if (cartId) {
      try {
        await deleteCart(cartId)
      } catch (err) {
        console.log('[ERROR] Cannot delete cart', err)
      }
    }
  }
}

const domains = []

schedule.scheduleJob('*/5 * * * *', () => {
  domains
    .filter(({ startCheck }) => new Date(startCheck).getTime() < Date.now())
    .forEach(({ name, maxPrice }) => main(name, maxPrice))
})
