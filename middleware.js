const { getUserByKey } = require('./users')

const chatAuth = (req, res, next) => {
  const { reciverId, senderId } = req.params;
  let { key } = req.query
  if (!key) {
    key = req.headers['x-key']
  }
  const userId = getUserByKey(key)
  console.log(userId, key, reciverId, senderId)
  if (userId && (userId.toString() === reciverId || userId.toString() === senderId)) {
    next()
  } else {
    res.status(401).send({ message: "You don't have access to this chat" })
  }

}

module.exports = {
  chatAuth
}