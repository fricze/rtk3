import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQueryWithZodValidation } from "./zod_query";
import z from "zod";

const Post = z.object({
  id: z.string(),
  name: z
    .string({
      required_error: "One of posts is missing title",
    })
    .min(10, { message: "Post title have to be 10 or more characters long." }),
});
const PostsResponse = z.array(Post);

export type Post = z.infer<typeof Post>;
export type PostsResponse = z.infer<typeof PostsResponse>;

export const api = createApi({
  baseQuery: baseQueryWithZodValidation(
    fetchBaseQuery({ baseUrl: "http://localhost:8000/" }),
  ),
  tagTypes: ["Post"],
  endpoints: (build) => ({
    getPosts: build.query<PostsResponse, void>({
      query: () => "posts",
      transformErrorResponse: (error, meta, arg) => {
        if (error.issues) {
          return error;
        }

        return error;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Post" as const, id })),
              { type: "Post", id: "LIST" },
            ]
          : [{ type: "Post", id: "LIST" }],
      extraOptions: {
        dataSchema: PostsResponse,
      },
    }),
    addPost: build.mutation<Post, Partial<Post>>({
      query: (body) => ({
        url: `posts`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Post", id: "LIST" }],
    }),
    getPost: build.query<Post, string>({
      query: (id) => `posts/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Post", id }],
    }),
    updatePost: build.mutation<void, Pick<Post, "id"> & Partial<Post>>({
      query: ({ id, ...patch }) => ({
        url: `posts/${id}`,
        method: "PUT",
        body: patch,
      }),
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          api.util.updateQueryData("getPost", id, (draft) => {
            Object.assign(draft, patch);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: "Post", id }],
    }),
    deletePost: build.mutation<{ success: boolean; id: number }, number>({
      query(id) {
        return {
          url: `posts/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: (_result, _error, id) => [{ type: "Post", id }],
    }),
  }),
});

export const {
  useGetPostQuery,
  useGetPostsQuery,
  useAddPostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = api;
