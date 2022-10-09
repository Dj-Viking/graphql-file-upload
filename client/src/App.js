import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { UPLOAD_FILE } from "./mutation.js";

import "./App.css";

function App() {
    const fileReader = new FileReader();
    const [files, setFiles] = useState([]);
    const [src, setSrc] = useState("");
    const [fileUploadMutation] = useMutation(UPLOAD_FILE);
    function fileView(event) {
        console.log("files", event.target.files);
        setFiles(event.target.files);
        const file = event.target.files[0];

        fileReader.onload = (event) => {
            setSrc(event.target.result);
        };
        if (!(file instanceof Blob)) return;
        fileReader.readAsDataURL(file);
    }

    function fileUpload(submitEvent) {
        submitEvent.preventDefault();
        // const formData = new FormData();
        (async () => {
            console.log("what is file", files[0]);
            const arrayBuffer = await files[0].arrayBuffer();
            console.log("what is array buffer", arrayBuffer);
            // formData.append("files", files[0]);
            try {
                await fileUploadMutation({
                    variables: {
                        file: files[0],
                    },
                });
            } catch (e) {
                console.error("error during file up[lopad", e);
            }
        })();
    }

    return (
        <div className="App">
            <input
                id="upload"
                onChange={fileView}
                type="file"
                accept="image/png,image/jpg"
                style={{ visibility: "hidden" }}
            />
            <button
                onClick={() => {
                    document.getElementById("upload").click();
                }}
            >
                get file
            </button>
            {files.length > 0 && src.length > 0 && (
                <>
                    <img
                        width="400px"
                        height={"auto"}
                        src={src}
                        alt="some-file"
                    />
                    <button onClick={fileUpload}>upload file</button>
                </>
            )}
        </div>
    );
}

export default App;
