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
                }).select("-__v -password");

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
        fileUpload: async (parent, { file }, context) => {
            if (context.user) {
                console.log(
                    "CALLED FILE UPLOAD!!!",
                    file,
                    "user uploading the photo",
                    context.user
                );
                const { createReadStream, filename, mimetype, encoding } =
                    await file;

                await Photo.create({
                    photoText: filename,
                    location: "some photo location",
                    user_id: context.user._id,
                });

                // Invoking the `createReadStream` will return a Readable Stream.
                // See https://nodejs.org/api/stream.html#stream_readable_streams
                const stream = createReadStream();

                // This is purely for demonstration purposes and will overwrite the
                // local-file-output.txt in the current working directory on EACH upload.
                const out = require("fs").createWriteStream(
                    `./photos/${filename}`
                );
                stream.pipe(out);
                await finished(out);

                return { filename, mimetype, encoding };
            } else {
                new AuthenticationError("must be logged in to do that!");
            }
        },

        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

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
