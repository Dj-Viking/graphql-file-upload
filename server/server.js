const fs = require("fs");
const express = require("express");
const graphqlUploadExpress = require("graphql-upload/graphqlUploadExpress.js");
const cors = require("cors");
const { ApolloServer } = require("apollo-server-express");
const path = require("path");

const { typeDefs, resolvers } = require("./schemas");
const { authMiddleware } = require("./utils/auth");
const db = require("./config/connection");

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve up static assets
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/build")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../client/public/index.html"));
    });
}

// Create a new instance of an Apollo server with the GraphQL schema
const startApolloServer = async () => {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        // cors: {
        //     origin: ["http://localhost:3000"],
        // },
        csrfPrevention: true,
        cache: "bounded",
        context: authMiddleware,
    });
    await server.start();

    app.use(graphqlUploadExpress());

    server.applyMiddleware({ app });

    db.once("open", () => {
        app.listen(PORT, () => {
            if (!fs.existsSync("./photos")) {
                console.log("no photos directory created, creating one now");
                fs.mkdirSync("photos");
            }

            console.log(`API server running on port ${PORT}!`);
            console.log(
                `Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
            );
        });
    });
};

// Call the async function to start the server
startApolloServer();
