import React, { useState } from "react";
import { Textarea } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useDeletePostMutation,
  useGetPostQuery,
  useUpdatePostMutation,
} from "../../app/services/posts";
import {
  Box,
  Button,
  Center,
  CloseButton,
  Flex,
  Heading,
  Input,
  Spacer,
  Stack,
  useToast,
} from "@chakra-ui/react";

const EditablePostName = ({
  name: initialName,
  content: initialContent,
  onUpdate,
  onCancel,
  isLoading = false,
}: {
  name: string;
  content: string;
  onUpdate: (name: string, content: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) => {
  const [name, setName] = useState(initialName);
  const [content, setContent] = useState(initialContent);

  const handleChange = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => setName(value);

  const handleContentChange = ({
    target: { value },
  }: React.ChangeEvent<HTMLTextAreaElement>) => setContent(value);

  const handleUpdate = () => onUpdate(name, content);
  const handleCancel = () => onCancel();

  return (
    <Flex>
      <Box flex={10}>
        <Input
          type="text"
          onChange={handleChange}
          value={name}
          disabled={isLoading}
        />

        <Textarea value={content} onChange={handleContentChange} />
      </Box>
      <Spacer />
      <Box>
        <Stack spacing={4} direction="row" align="center">
          <Button onClick={handleUpdate} isLoading={isLoading}>
            Update
          </Button>
          <CloseButton bg="red" onClick={handleCancel} disabled={isLoading} />
        </Stack>
      </Box>
    </Flex>
  );
};

const PostJsonDetail = ({ id }: { id: string }) => {
  const { data: post } = useGetPostQuery(id);

  return (
    <Box mt={5} bg="#eee">
      <pre style={{ textWrap: "pretty" }}>{JSON.stringify(post, null, 2)}</pre>
    </Box>
  );
};

export const PostDetail = () => {
  const { id } = useParams<{ id: any }>();
  const navigate = useNavigate();

  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);

  const { data: post, isLoading } = useGetPostQuery(id);

  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();

  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

  if (isLoading) {
    return (
      <Box p={4}>
        <div>Loading...</div>
      </Box>
    );
  }

  if (!post) {
    return (
      <Center h="200px">
        <Heading size="md">
          Post {id} is missing! Try reloading or selecting another post...
        </Heading>
      </Center>
    );
  }

  return (
    <Box p={4} maxWidth={"100%"}>
      {isEditing ? (
        <EditablePostName
          name={post.name}
          content={post.content || ""}
          onUpdate={async (name, content) => {
            try {
              await updatePost({ id, name, content }).unwrap();
            } catch {
              toast({
                title: "An error occurred",
                description: "We couldn't save your changes, try again!",
                status: "error",
                duration: 2000,
                isClosable: true,
              });
            } finally {
              setIsEditing(false);
            }
          }}
          onCancel={() => setIsEditing(false)}
          isLoading={isUpdating}
        />
      ) : (
        <Flex>
          <Box>
            <Heading size="md">{post.name}</Heading>
          </Box>
          <Spacer />
          <Box>
            <Stack spacing={4} direction="row" align="center">
              <Button
                onClick={() => setIsEditing(true)}
                disabled={isDeleting || isUpdating}
              >
                {isUpdating ? "Updating..." : "Edit"}
              </Button>
              <Button
                onClick={() => deletePost(id).then(() => navigate("/posts"))}
                disabled={isDeleting}
                colorScheme="red"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </Stack>
          </Box>
        </Flex>
      )}
      <PostJsonDetail id={post.id} />
    </Box>
  );
};
