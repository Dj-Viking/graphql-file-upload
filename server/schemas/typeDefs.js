const { gql } = require("apollo-server-express");

const typeDefs = gql`
    type User {
        _id: ID
        username: String
        email: String
        friendCount: Int
        friends: [User]
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
        fileUpload(file: Upload!): File!
        login(email: String!, password: String!): Auth
        addUser(username: String!, email: String!, password: String!): Auth
        addFriend(friendId: ID!): User
    }
`;

module.exports = typeDefs;
