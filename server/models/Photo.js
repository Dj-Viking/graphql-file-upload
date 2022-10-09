const { Schema, model } = require("mongoose");
const dateFormat = require("../utils/dateFormat");

const photoSchema = new Schema(
    {
        filename: {
            type: String,
            required: "need a filename",
            unique: true,
        },
        title: {
            type: String,
            required: "You need to leave a Photo!",
        },
        photoSrc: {
            type: String,
            required: "You need to leave a Photo!",
        },
        location: {
            type: String,
            required: "You must include a location",
            minlength: 1,
            maxlength: 40,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            get: (timestamp) => dateFormat(timestamp),
        },
        uploader: {
            type: String,
            required: true,
        },
    },
    {
        toJSON: {
            getters: true,
        },
    }
);

const Photo = model("Photo", photoSchema);

module.exports = Photo;
