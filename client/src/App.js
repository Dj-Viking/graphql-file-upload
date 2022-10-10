import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { UPLOAD_FILE, SIGNUP, LOGIN, DELETE_PHOTO } from "./mutation.js";

import "./App.css";
import { ME } from "./query.js";

function App() {
    const fileReader = new FileReader();
    const [files, setFiles] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [src, setSrc] = useState("");
    const { refetch } = useQuery(ME);
    const [loggedIn, setLoggedIn] = useState(false);
    const [deletePhotoMutation] = useMutation(DELETE_PHOTO);
    const [fileUploadMutation] = useMutation(UPLOAD_FILE);
    const [signupMutation] = useMutation(SIGNUP);
    const [loginMutation] = useMutation(LOGIN);
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
                await signupMutation();
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
                setPhotos(res.data.login.user.photos);
                localStorage.setItem("id_token", res.data.login.token);
                setLoggedIn(true);
            } catch (error) {
                console.error("error during login", error);
            }
        })();
    }

    function logout() {
        setLoggedIn(false);
        localStorage.removeItem("id_token");
        setPhotos([]);
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

    function deletePhoto(event) {
        event.preventDefault();
        (async () => {
            try {
                await deletePhotoMutation({
                    variables: {
                        _id: event.target.id,
                    },
                });
                setPhotos(
                    photos.filter((photo) => photo._id !== event.target.id)
                );
            } catch (error) {
                console.error("error when deleting photo", error);
            }
        })();
    }

    useEffect(() => {
        (async () => {
            //refetch after files.length changes and set the photos the user currently has
            const res = await refetch();
            setPhotos(res.data.me.photos);
            if (localStorage.getItem("id_token")) {
                setLoggedIn(true);
            } else {
                setLoggedIn(false);
            }
        })();
    }, [files.length, refetch]);

    return (
        <div className="App">
            <span>{loggedIn ? "LOGGED IN" : "NOT LOGGED IN"}</span>
            <button onClick={login}>log in</button>
            <button onClick={logout}>log out</button>
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
                get photo
            </button>
            {files.length > 0 && src.length > 0 && (
                <>
                    <p>=======</p>
                    <p>Photo to upload</p>
                    <img
                        width="400px"
                        height={"auto"}
                        src={src}
                        alt="some-file"
                    />
                    <button onClick={fileUpload}>upload photo</button>
                    <p>=======</p>
                </>
            )}
            {photos.length > 0 && (
                <>
                    <h2>my photos</h2>
                    {photos.map((photo) => {
                        return (
                            <div key={Math.random() * 1000 + "kdjfdkjf"}>
                                <p>Title: {photo.title}</p>
                                <p>location: {photo.location}</p>
                                <img
                                    width="400px"
                                    height="auto"
                                    src={photo.photoSrc}
                                    alt="something"
                                />
                                <button id={photo._id} onClick={deletePhoto}>
                                    delete photo
                                </button>
                            </div>
                        );
                    })}
                </>
            )}
        </div>
    );
}

export default App;
