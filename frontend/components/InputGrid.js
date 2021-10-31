import React, { useState, useEffect } from "react";

import {
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Button,
} from "@chakra-ui/react";
import { Formik, Form, Field } from "formik";

import axios from "axios";

import {
  validateBaseName,
  validateNumberOfPlaylists,
} from "../utils/inputGridValidation";
import SongsButton from "./SongsButton";

const BACKEND_URL = "/cluster";

const InputGrid = ({ setPlaylists, setRootName, setUris }) => {
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const [token, setToken] = useState("");
  var results = [];

  useEffect(async () => {
    if (localStorage.getItem("accessToken")) {
      setToken(localStorage.getItem("accessToken"));
    }
  }, []);

  const createSongs = async () => {
    setPlaylists([]);
    for (var playlist in results[0].playlists) {
      var tempSongs = [];
      for (var song in results[0].playlists[playlist]) {
        tempSongs.push(results[0].playlists[playlist][song]);
      }
      setPlaylists((playlists) => [...playlists, tempSongs]);
    }
    setUris([]);
    for (var playlist in results[0].uris) {
      var tempUris = [];
      for (var song in results[0].uris[playlist]) {
        tempUris.push(results[0].uris[playlist][song]);
      }
      setUris((uris) => [...uris, tempUris]);
    }
  };

  return (
    <>
      <SongsButton
        checkedItems={checkedItems}
        setCheckedItems={setCheckedItems}
        playlists={userPlaylists}
        setPlaylists={setUserPlaylists}
      />
      <h1 className="step-element">3. Insert data:</h1>
      <Formik
        initialValues={{
          numberOfPlaylists: "",
          baseName: "",
        }}
        onSubmit={async (values, actions) => {
          setRootName(values.baseName);
          results = [];
          let userSelectedPlaylists = [];
          checkedItems.map((item) => {
            userSelectedPlaylists.push(userPlaylists.items[item]);
          });
          let user = await axios.get("https://api.spotify.com/v1/me", {
            headers: {
              Authorization: "Bearer " + token,
            },
          });

          let res = await axios.post(BACKEND_URL, {
            headers: {
              "Content-Type": "application/json",
            },
            data: {
              username: user.data["display_name"],
              accessToken: token,
              selectedPlaylists: JSON.stringify(userSelectedPlaylists),
              userNumberOfPlaylists: values.numberOfPlaylists,
            },
          });
          // console.log(res);
          results.push(res.data);
          // console.log(results[0].playlists);
          await createSongs();
          actions.setSubmitting(false);
        }}
      >
        {(props) => (
          <Form>
            <Field
              name="numberOfPlaylists"
              validate={validateNumberOfPlaylists}
            >
              {({ field, form }) => (
                <FormControl
                  id="numberOfPlaylists"
                  isInvalid={
                    form.errors.numberOfPlaylists &&
                    form.touched.numberOfPlaylists
                  }
                >
                  <FormLabel htmlFor="numberOfPlaylists">
                    How many playlists do you want to generate?
                  </FormLabel>
                  <Input
                    {...field}
                    id="numberOfPlaylists"
                    type="number"
                    placeholder="1, 2, 3, ..."
                  />
                  <FormErrorMessage color="error">
                    {form.errors.numberOfPlaylists}
                  </FormErrorMessage>
                </FormControl>
              )}
            </Field>
            <Field name="baseName" validate={validateBaseName}>
              {({ field, form }) => (
                <FormControl
                  id="baseName"
                  isInvalid={form.errors.baseName && form.touched.baseName}
                >
                  <FormLabel htmlFor="baseName">
                    Insert the base name for the new playlists:
                  </FormLabel>
                  <Input
                    {...field}
                    id="baseName"
                    type="text"
                    placeholder="My New Playlist..."
                  />
                  <FormErrorMessage color="error">
                    {form.errors.baseName}
                  </FormErrorMessage>
                </FormControl>
              )}
            </Field>
            <Button
              mt={4}
              bg="buttons"
              isLoading={props.isSubmitting}
              type="submit"
            >
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default InputGrid;
