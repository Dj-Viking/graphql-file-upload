const { Schema, model } = require('mongoose');
const dateFormat = require('../utils/dateFormat');

const photoSchema = new Schema(
  {
    photoText: {
      type: String,
      required: 'You need to leave a Photo!',
      minlength: 1,
      maxlength: 280
    },
    location: {
        type: String,
        required: "You must include a location",
        minlength: 1,
        maxlength: 40
    },
    createdAt: {
      type: Date,
      default: Date.now,
      get: timestamp => dateFormat(timestamp)
    },
    username: {
      type: String,
      required: true
    },
  },
  {
    toJSON: {
      getters: true
    }
  }
);

photoSchema.virtual('photoCount').get(function() {
  return this.photos.length;
});

const Photo = model('photo', photoSchema);

module.exports = Photo;
