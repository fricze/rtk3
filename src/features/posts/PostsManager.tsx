import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  List,
  ListIcon,
  ListItem,
  Spacer,
  useToast,
} from "@chakra-ui/react";
import { MdBook } from "react-icons/md";
import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Link } from "@chakra-ui/react";

import {
  Post,
  useAddPostMutation,
  useGetPostQuery,
  useGetPostsQuery,
} from "../../app/services/posts";
import { PostDetail } from "./PostDetail";
import { v4 as uuid } from "uuid";
import { APIError } from "../../app/services/zod_query";
import { SerializedError } from "@reduxjs/toolkit";

const AddPostError = ({ error }: { error: APIError | SerializedError }) => {
  if (typeof error === "string") {
    return <FormErrorMessage>{error}</FormErrorMessage>;
  }

  if (typeof error === "object" && "issues" in error) {
    return (
      <>
        {error.issues?.map(({ message }) => (
          <FormErrorMessage className="error">{message}</FormErrorMessage>
        ))}
      </>
    );
  }
};

const AddPost = () => {
  const initialValue: Post = { id: uuid(), name: "" };
  const [post, setPost] = useState(initialValue);
  const [addPost, { isLoading, error, isError }] = useAddPostMutation();

  const handleChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    setPost((prev) => ({
      ...prev,
      [target.name]: target.value,
    }));
  };

  const handleAddPost = () =>
    addPost(post).then((result) => {
      if ("error" in result) {
        return;
      }

      setPost(initialValue);
    });

  return (
    <div className="new-post">
      <FormControl isInvalid={isError} className="form-control">
        <FormLabel htmlFor="name" className="form-label">
          New post
        </FormLabel>
        <Input
          id="name"
          name="name"
          className="form-input"
          placeholder="Enter post name"
          value={post.name}
          onChange={handleChange}
        />

        {isError ? <AddPostError error={error} /> : null}
      </FormControl>

      <button onClick={handleAddPost} className="form-button">
        Add Post
      </button>
    </div>
  );
};

const PostList = () => {
  const { data: posts, isLoading, error } = useGetPostsQuery();
  const toast = useToast();

  const navigate = useNavigate();

  useEffect(() => {
    if (!error) {
      return;
    }

    if ("issues" in error) {
      error.issues
        ?.map(({ message }) => message)
        .forEach((message) => {
          toast({
            title: "Data fetching error",
            description: message,
            status: "error",
            duration: 2000,
            isClosable: true,
          });
        });
    }

    if ("message" in error && typeof error.message === "string") {
      toast({
        title: "Data fetching error",
        description: error.message,
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return <div>Loading</div>;
  }

  if (!posts) {
    return <div>No posts :(</div>;
  }

  return (
    <List spacing={3}>
      {posts.map(({ id, name, content, created }) => (
        <ListItem key={id} onClick={() => navigate(`/posts/${id}`)}>
          <Link>
            <ListIcon as={MdBook} color="green.500" />
            {name}
            {created ? (
              <p>
                Created: <i>{created}</i>
              </p>
            ) : null}
            {content ? (
              <p>
                Excerpt: <i>{content}</i>
              </p>
            ) : null}
          </Link>
        </ListItem>
      ))}
    </List>
  );
};

const PostNameSubscribed = ({ id }: { id: string }) => {
  const { data, isFetching } = useGetPostQuery(id);
  const navigate = useNavigate();

  console.log("data", data, isFetching);

  if (!data) return null;

  return (
    <ListItem key={id} onClick={() => navigate(`/posts/${id}`)}>
      <Link>
        <ListIcon as={MdBook} color="green.500" />
        {data.name}
      </Link>
    </ListItem>
  );
};
const PostListSubscribed = () => {
  const { data: posts, isLoading } = useGetPostsQuery();

  if (isLoading) {
    return <div>Loading</div>;
  }

  if (!posts) {
    return <div>No posts :(</div>;
  }

  return (
    <List spacing={3}>
      {posts.map(({ id }) => (
        <PostNameSubscribed id={id} key={id} />
      ))}
    </List>
  );
};

export const PostsCountStat = () => {
  const { data: posts } = useGetPostsQuery();

  if (!posts) return null;

  return (
    <div className="stats">
      <h1>Active Posts</h1>
      <p>{posts?.length}</p>
    </div>
  );
};

export const PostsManager = () => {
  return (
    <Box>
      <Flex bg="#011627" p={4} color="white">
        <Flex width={"100vw"} maxWidth={"1200px"} margin={"0 auto"}>
          <Heading size="xl">Manage Posts</Heading>
          <Spacer />
          <PostsCountStat />
        </Flex>
      </Flex>

      <Divider />

      <Box maxWidth={"1200px"} margin={"0 auto"}>
        <AddPost />
        <Divider />
        <Flex wrap="wrap">
          <Box flex={1} borderRight="1px solid #eee">
            <Box p={4} borderBottom="1px solid #eee">
              <Heading
                size="sm"
                sx={{
                  textDecoration: "underline",
                  textDecorationColor: "#6f6f92",
                  textDecorationThickness: "3px",
                  textUnderlineOffset: "3px",
                }}
              >
                Posts
              </Heading>
            </Box>

            <Box p={4}>
              <PostList />
            </Box>
          </Box>
          <Box flex={2}>
            <Routes>
              <Route path="/posts/:id" element={<PostDetail />} />
              <Route
                path="*"
                element={
                  <Center h="200px">
                    <Heading size="md">Select a post to edit!</Heading>
                  </Center>
                }
              />
            </Routes>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default PostsManager;
