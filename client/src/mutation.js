import { gql } from "@apollo/client";
export const UPLOAD_FILE = gql`
    mutation FileUpload($file: Upload!) {
        fileUpload(file: $file) {
            _id
            photos {
                _id
                photoText
                location
                user_id
                createdAt
            }
        }
    }
`;

export const SIGNUP = gql`
    mutation {
        addUser(
            username: "viking"
            email: "viking@viking.com"
            password: "viking"
        ) {
            token
            user {
                _id
            }
        }
    }
`;

export const LOGIN = gql`
    mutation {
        login(email: "viking@viking.com", password: "viking") {
            token
            user {
                _id
                photos {
                    location
                    photoSrc
                    title
                    _id
                }
            }
        }
    }
`;

export const DELETE_PHOTO = gql`
    mutation deletePhoto($_id: ID!) {
        deletePhoto(_id: $_id)
    }
`;
