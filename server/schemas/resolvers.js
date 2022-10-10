const fs = require("fs");
const { AuthenticationError } = require("apollo-server-express");
const { User, Photo } = require("../models");
const GraphQLUpload = require("graphql-upload/GraphQLUpload.js");
const { finished } = require("stream/promises");
const { signToken } = require("../utils/auth");

const resolvers = {
    Upload: GraphQLUpload,
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({
                    _id: context.user._id,
                })
                    .select("-__v -password")
                    .populate("photos");

                return userData;
            }

            throw new AuthenticationError("Not logged in");
        },
        users: async () => {
            return User.find().select("-__v -password");
        },
        user: async (parent, { username }) => {
            return User.findOne({ username }).select("-__v -password");
        },
    },

    Mutation: {
        deletePhoto: async (parent, { _id }, context) => {
            try {
                const photo = await Photo.findOne({ _id });
                // delete photo from photos directory by filename
                const filepath = `./photos/${photo.filename}`;
                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                }
                await Photo.deleteOne({ _id });
                return true;
            } catch (error) {
                return false;
            }
        },
        fileUpload: async (parent, { file }, context) => {
            try {
                if (context.user) {
                    const { createReadStream, filename } = await file;

                    // Invoking the `createReadStream` will return a Readable Stream.
                    // See https://nodejs.org/api/stream.html#stream_readable_streams
                    const stream = createReadStream();

                    // This is purely for demonstration purposes and will overwrite the
                    // file in photos with the filename specified here in the current working directory (server directory) on EACH upload.
                    const out = fs.createWriteStream(`./photos/${filename}`);
                    stream.pipe(out);
                    await finished(out);

                    //after writing the file to disk, create a base64 string representation of the picture
                    const filebase64str = fs.readFileSync(
                        `./photos/${filename}`,
                        {
                            encoding: "base64",
                        }
                    );

                    const fileExtension = filename
                        .split(/\./g) //split string on the dot
                        .find((item) => /jpg|png/g.test(item)); //find the item in the array that matches the regex pattern

                    // rough example probably bad for memory storage
                    // value to place directly into the react <img /> tag
                    // i.e. <img src={photo.photoSrc} />
                    const photo = await Photo.create({
                        filename,
                        title: "some photo text",
                        photoSrc:
                            `data:image/${fileExtension};base64, ` +
                            filebase64str,
                        location: "some photo location",
                        uploader: context.user._id,
                    });

                    const user = await User.findOneAndUpdate(
                        { _id: context.user._id },
                        {
                            $addToSet: { photos: photo._id },
                        },
                        { new: true }
                    ).populate("photos");

                    return user;
                } else {
                    throw new AuthenticationError(
                        "must be logged in to do that!"
                    );
                }
            } catch (error) {
                console.error("error in file upload", error);
            }
        },

        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email }).populate("photos");

            if (!user) {
                throw new AuthenticationError("Incorrect credentials");
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError("Incorrect credentials");
            }

            const token = signToken(user);
            return { token, user };
        },
        addFriend: async (parent, { friendId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { friends: friendId } },
                    { new: true }
                ).populate("friends");

                return updatedUser;
            }

            throw new AuthenticationError("You need to be logged in!");
        },
    },
};

module.exports = resolvers;
