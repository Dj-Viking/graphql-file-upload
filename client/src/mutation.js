import { gql } from "@apollo/client";
export const UPLOAD_FILE = gql`
    mutation FileUpload($file: Upload!) {
        fileUpload(file: $file) {
            filename
            mimetype
            encoding
        }
    }
`;
