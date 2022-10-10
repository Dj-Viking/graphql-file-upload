const { gql } = require("apollo-server-express");

const typeDefs = gql`
    type User {
        _id: ID
        username: String
        email: String
        photoCount: Int
        photos: [Photo]
    }

    type Photo {
        _id: ID!
        title: String
        filename: String
        photoSrc: String
        createdAt: String
        user_id: String
        location: String
    }

    scalar Upload

    type File {
        filename: String!
        mimetype: String!
        encoding: String!
    }

    type Auth {
        token: ID!
        user: User
    }

    type Query {
        otherFields: Boolean!
        me: User
        users: [User]
        user(username: String!): User
    }

    type Mutation {
        fileUpload(file: Upload!): User
        login(email: String!, password: String!): Auth
        addUser(username: String!, email: String!, password: String!): Auth
        addFriend(friendId: ID!): User
        deletePhoto(_id: ID!): Boolean
    }
`;

module.exports = typeDefs;
