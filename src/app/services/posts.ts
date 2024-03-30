import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseQueryWithZodValidation } from "./zod_query";
import z from "zod";

const Post = z.object({
  id: z.string(),
  name: z
    .string({
      required_error: "Post is missing title",
    })
    .min(10, { message: "Post title have to be 10 or more characters long." })
    .refine((title) => title[0].toUpperCase() === title[0], {
      message: "First letter of post title have to be uppercase",
    }),
  content: z.string().optional(),
  created: z.coerce
    .date()
    .transform((date) => date.toLocaleDateString())
    .optional(),
});

const PostWithExcerpt = Post.extend({
  content: z
    .string()
    .transform((content) => content.substring(0, 30).concat("…"))
    .optional(),
});
const PostsWithExcerptResponse = z.array(PostWithExcerpt);

export type Post = z.infer<typeof Post>;
export type PostsWithExcerptResponse = z.infer<typeof PostsWithExcerptResponse>;

export const api = createApi({
  baseQuery: baseQueryWithZodValidation(
    fetchBaseQuery({ baseUrl: "http://localhost:8000/" }),
  ),
  tagTypes: ["Post"],
  endpoints: (build) => ({
    getPosts: build.query<PostsWithExcerptResponse, void>({
      query: () => "posts",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Post" as const, id })),
              { type: "Post", id: "LIST" },
            ]
          : [{ type: "Post", id: "LIST" }],
      extraOptions: {
        dataSchema: PostsWithExcerptResponse,
      },
    }),
    addPost: build.mutation<Post, Partial<Post>>({
      query: (body) => ({
        url: `posts`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Post", id: "LIST" }],
      extraOptions: {
        argsSchema: Post,
      },
    }),
    getPost: build.query<Post, string>({
      query: (id) => `posts/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Post", id }],
      extraOptions: {
        dataSchema: Post,
      },
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
