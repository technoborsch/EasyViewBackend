const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 *  Schema for a token model.
 *
 *  Token is a temporary record in database, used to wait for actions that user has to perform using information that
 *  has been sent to him via email, i.e. password reset, signup confirmation etc.
 *
 *  It has a flag "forReset" which shows if it is for reset or for activation.
 *
 */
const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'user',
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600,// this is the expiry time in seconds
  },
  forReset: {
    type: Boolean,
    default: false,
  }
});

module.exports = mongoose.model("Token", tokenSchema);