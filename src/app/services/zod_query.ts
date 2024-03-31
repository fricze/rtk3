import { ZodError, ZodSchema } from "zod";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query/react";

export type APIError = FetchBaseQueryError & Partial<ZodError>;

export type TBaseQuery = BaseQueryFn<
  string | FetchArgs,
  unknown,
  APIError,
  { dataSchema?: ZodSchema; argsSchema?: ZodSchema },
  FetchBaseQueryMeta
>;

/**
 * HOF that wraps a base query function with additional functionality for data validation using zod
 *
 * @param baseQuery The base query function to be wrapped.
 * @returns A modified version of the baseQuery with added data validation.
 */
export const baseQueryWithZodValidation: (
  baseQuery: TBaseQuery,
) => TBaseQuery =
  (baseQuery: TBaseQuery) => async (args, api, extraOptions) => {
    const zodArgsSchema = extraOptions?.argsSchema;

    if (typeof args === "object" && "body" in args && zodArgsSchema) {
      try {
        zodArgsSchema.parse(args.body);
      } catch (error) {
        if (error instanceof ZodError) {
          const issuesData = {
            issues: error.issues,
            data: args.body,
          } as unknown as undefined;
          return { error: issuesData, data: args.body };
        }
      }
    }
    // Call the original baseQuery function with the provided arguments
    const returnValue = await baseQuery(args, api, extraOptions);

    // Retrieve the data schema from the extraOptions object
    const zodDataSchema = extraOptions?.dataSchema;

    const { data } = returnValue;

    // Check if both 'data' and 'zodSchema' are defined
    if (data && zodDataSchema) {
      try {
        return { ...returnValue, data: zodDataSchema.parse(data) };
      } catch (error) {
        if (error instanceof ZodError) {
          console.log(data);
          console.log(error);
          const issuesData = {
            issues: error.issues,
            data: data,
          } as unknown as undefined;
          return { error: issuesData, data };
        }
      }
    }

    return returnValue;
  };
