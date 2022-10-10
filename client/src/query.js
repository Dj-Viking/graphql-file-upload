const { gql } = require("@apollo/client");
export const ME = gql`
    query me {
        me {
            _id
            photos {
                _id
                title
                photoSrc
                filename
                location
                createdAt
            }
        }
    }
`;
