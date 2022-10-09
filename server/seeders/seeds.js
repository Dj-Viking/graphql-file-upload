// const faker = require('faker');
const userSeeds = require("./userSeed.json");
const photoSeeds = require("./photoSeed.json");
const db = require("../config/connection");
const { User, Photo } = require("../models");

db.once("open", async () => {
    try {
        await Photo.deleteMany({});
        await User.deleteMany({});

        await User.create(userSeeds);

        for (let i = 0; i < photoSeeds.length; i++) {
            const { _id, thoughtAuthor } = await Photo.create(photoSeeds[i]);
            const user = await User.findOneAndUpdate(
                { username: thoughtAuthor },
                {
                    $addToSet: {
                        thoughts: _id,
                    },
                }
            );
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    }

    console.log("all done!");
    process.exit(0);
});
