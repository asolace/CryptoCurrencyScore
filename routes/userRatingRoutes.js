const User = require('../models/User')
const UserRating = require('../models/UserRating')
const Coin = require('../models/Coin')

module.exports = app => {
  app.get('/api/user/rating-list', async (req, res) => {
    let result = await User.find()
      .where(req.query)
      .where({rating: { $ne: 'N' }})
      .populate({
        path: '_coinId',
        select: ['name', 'symbol', 'url', 'logo']
      })

    res.json(result)
  })

  app.get('/api/user/rating', async (req, res) => {
    let result = await User.findOne(req.query)
    let response = {}

    if (result === null) {
      response.message = 'Not yet rated'
      response.success = false
      res.json(response)
    } else {
      response.rating = result.rating
      response.success = true
      res.json(response)
    }
  })

  app.post('/api/coin-update', (req, res) => {
    const { coinId, userId, coinRatingUpdate } = req.body

    User.addOrUpdateUserRating(coinId, userId, coinRatingUpdate, (message, coinId) => {
      Coin.calculateAndUpdateCoinRating(coinId)
      res.json(message)
    })
  })

  app.get('/api/user/ratings-count', async (req, res) => {
    let result = await User.find()
      .where(req.query).count()

    res.json({ count: result })
  })
}
