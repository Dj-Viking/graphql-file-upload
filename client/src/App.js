import React, { useEffect, useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { UPLOAD_FILE } from "./mutation.js";

import "./App.css";

function App() {
    const fileReader = new FileReader();
    const [files, setFiles] = useState([]);
    const [src, setSrc] = useState("");
    const [loggedIn, setLoggedIn] = useState(false);
    const [fileUploadMutation] = useMutation(UPLOAD_FILE);
    const [signupMutation] = useMutation(gql`
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
    `);
    const [loginMutation] = useMutation(gql`
        mutation {
            login(email: "viking@viking.com", password: "viking") {
                token
                user {
                    _id
                }
            }
        }
    `);
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

    function signup(e) {
        e.preventDefault();
        (async () => {
            try {
                const res = await signupMutation();
                console.log("sign up res", res);
                setLoggedIn(true);
            } catch (error) {
                console.error("error during signup", error);
            }
        })();
    }

    function login(e) {
        e.preventDefault();
        (async () => {
            try {
                const res = await loginMutation();
                console.log("res in login", res);
                localStorage.setItem("id_token", res.data.login.token);
                setLoggedIn(true);
            } catch (error) {
                console.error("error during login", error);
            }
        })();
    }

    function fileUpload(submitEvent) {
        submitEvent.preventDefault();
        (async () => {
            try {
                await fileUploadMutation({
                    variables: {
                        file: files[0],
                    },
                });
                setFiles([]);
            } catch (e) {
                console.error("error during file up[lopad", e);
            }
        })();
    }

    useEffect(() => {
        if (localStorage.getItem("id_token")) {
            setLoggedIn(true);
        } else {
            setLoggedIn(false);
        }
    }, [files.length]);

    return (
        <div className="App">
            <span>{loggedIn ? "LOGGED IN" : "NOT LOGGED IN"}</span>
            <button onClick={login}>log in</button>
            <button
                onClick={() => {
                    localStorage.removeItem("id_token");
                    setLoggedIn(false);
                }}
            >
                log out
            </button>
            <button onClick={signup}>signup</button>
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
