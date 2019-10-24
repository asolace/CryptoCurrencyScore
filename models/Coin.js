const mongoose = require('mongoose')
const User = require('./User')
const ObjectId = mongoose.Schema.ObjectId
const helper = require('../helper')

const CoinSchema = mongoose.Schema({
  ccId: Number,
  name: String,
  symbol: { type: String, unique: true },
  rank: Number,
  url: String, // Need
  logo: String,
  algorithm: String,
  proofOfType: String,
  description: String, // Need
  features: String, // Need
  technology: String, // Need
  twitter: Object, // Need
  reddit: Object, // Need
  facebook: Object, // Need
  repo: Object, // Need
  price_usd: Number, // Need
  price_btc: Number, // Need
  market_cap_usd: Number, // Need
  available_supply: Number, // Need
  total_supply: Number, 
  max_supply: Number, // Need
  percent_change_1h: Number, // Need
  percent_change_24h: Number, // Need
  percent_change_7d: Number, // Need
  last_updated: String, 
  ico: Object,
  ratingLetter: { type: String, default: "N" },
  ratingNumber: { type: Number, default: 0 },
  ratedBy: [{ type: ObjectId, ref: 'User' }]
})

const Coin = module.exports = mongoose.model('Coin', CoinSchema)

module.exports.getCoinsMappedWithUserRankList = async (query, _userId, cb) => {
  const UserIdToSearch = mongoose.Types.ObjectId(_userId)

  let coins = await Coin.aggregate([
    { $match: query },
    { $addFields: {
      'ratedBy': {
        $filter: {
          input: '$ratedBy',
          as: 'ratedBy',
          cond: { $in: ['$$ratedBy', [UserIdToSearch]]}
        }
      }
    }},
    { $lookup:
      {
        from: 'users',
        localField: 'ratedBy',
        foreignField: '_id',
        as: 'userRating'
      }
    },
    { $addFields: {
      'userRating': { $arrayElemAt: ['$userRating.ratedCoins', 0] }
    }},
    { $addFields: {
      'userRating': {
        $filter: {
          input: '$userRating',
          as: 'userRating',
          cond: { $and: [
            { $eq: ['$$userRating.deleted', false] },
            { $eq: ['$$userRating._coinId', '$_id'] }
          ]}
        }
      }
    }},
    { $addFields: {
      'userRating': '$userRating.rating'
    }}
  ])

  cb(coins)
}


// The crux of the app (The magical algorithm) jk it's simple
module.exports.calculateAndUpdateCoinRating = async (ratingData, isNew) => {
  const CoinIdToSearch = mongoose.Types.ObjectId(ratingData._coinId)

  const SumProductOfAllUiAndUrOfRatedCoinArray = await Coin.aggregate([
    { $match: { _id: CoinIdToSearch }},
    { $lookup:
      {
        from: 'users',
        localField: 'ratedBy',
        foreignField: '_id',
        as: 'users'
      }
    },
    { $unwind: '$users' },
    { $project: { _id: '$users._id', ratedCoins: '$users.ratedCoins' }},
    { $unwind: '$ratedCoins' },
    { $match: { 'ratedCoins._coinId': CoinIdToSearch, 'ratedCoins.deleted': false }},
    { $group:
      {
        _id: null,
        sumProductOfAllUiAndUr: { $sum: '$ratedCoins.productOfUiAndUr' },
        sumOfAllUi: { $sum: '$ratedCoins.userUi' }
      }
    }
  ])

  let sumProdUiUr = 0
  let sumUi = 0

  if (SumProductOfAllUiAndUrOfRatedCoinArray.length > 0) {
    sumProdUiUr = SumProductOfAllUiAndUrOfRatedCoinArray[0].sumProductOfAllUiAndUr
    sumUi = SumProductOfAllUiAndUrOfRatedCoinArray[0].sumOfAllUi
  }

  let ratingAsNumber = helper.calculateRatingAsNumber(sumProdUiUr, sumUi)
  let ratingAsLetter = helper.convertRatingNumberToLetter(ratingAsNumber)

  let update = await Coin.findOneAndUpdate({ _id: CoinIdToSearch }, { ratingLetter: ratingAsLetter, ratingNumber: ratingAsNumber })
}


module.exports.addUserToCoinRatedByArray = (ratingData, userId, cb) => {
  let query = { _id: ratingData._coinId, 'ratedBy._id': { $ne: userId }}

  Coin.update(query, { $addToSet: { ratedBy: { _id: userId }}}, (err, coin) => {
    if (err) console.log(`Error in pushing user id to rated by in Coins: ${err}`)

    let responseMessage = { success: true, message: 'Coin add rating success'}
    cb(responseMessage, ratingData)
  })
}




////////////////////////////////////////
// UPDATE COIN DATA FORM API SECTION //
///////////////////////////////////////

// Updates Coin Data from API
module.exports.addOrUpdateCoin = coinData => {
  const query = { symbol: coinData.symbol }

  Coin.findOne(query).then(data => {
    if (data === null) {
      let newCoin = new Coin(coinData)
      newCoin.save(() => console.log(`${coinData.symbol} Saved!`))
    } else {
      Coin.findOneAndUpdate(query, coinData, (err, coin) => {
        if (err) console.log(`Update Error: ${err}`)
        else console.log(`${coinData.symbol} Updated!`)
      })
    }
  })
}

// Updates Coin Social Data from API
module.exports.updateSocialCoin = coinData => {
  const query = { ccId: coinData.ccId }

  Coin.findOne(query).then(data => {
    if (data === null) {
      console.log(`Coin id: ${coinData.ccId} doesn't exsist.`)
    } else {
      Coin.findOneAndUpdate(query, coinData, (err, coin) => {
        if (err) console.log('Social Update Error: ' + err)
        else console.log(`id: ${coin.id} Social Updated!`)
      })
    }
  })
}
