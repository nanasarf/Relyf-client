import { baseApi } from './baseApi'
import type { Image, UploadImageResponse } from '../types/images'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

export const imagesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // POST /api/images (JSON with base64 data URL)
    uploadImage: build.mutation<
      UploadImageResponse,
      { file: File; ownerId: number | string; ownerType: string }
    >({
      queryFn: async ({ file, ownerId, ownerType }, _api, _extraOptions, baseQuery) => {
        try {
          // Convert file to base64 data URL (full format: data:image/png;base64,...)
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
              const result = reader.result as string
              resolve(result) // Keep the full data URL
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
          })

          // Send as JSON - matching TEST 2 from backend test script
          const result = await baseQuery({
            url: '/api/images',
            method: 'POST',
            body: {
              ownerType,
              ownerId: Number(ownerId),
              source: dataUrl, // Base64 data URL in source field
              altText: file.name,
            },
          })

          if (result.error) {
            return { error: result.error as FetchBaseQueryError }
          }

          return { data: result.data as UploadImageResponse }
        } catch (error) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: String(error),
              data: error,
            } as FetchBaseQueryError,
          }
        }
      },
      invalidatesTags: (_, __, arg) => [
        { type: 'Image', id: `${arg.ownerType}-${arg.ownerId}` },
        // When uploading to a Project, invalidate project caches so imageUrl updates
        ...(arg.ownerType === 'Project' ? [
          { type: 'Project' as const, id: arg.ownerId },
          { type: 'Projects' as const, id: 'LIST' },
          { type: 'Projects' as const, id: 'FEED' },
        ] : []),
      ],
    }),

    // GET /api/Images/{ownerType}/{ownerId}
    getImagesByOwner: build.query<Image[], { ownerType: string; ownerId: number | string }>({
      query: ({ ownerType, ownerId }) => ({
        url: `/api/Images/${ownerType}/${ownerId}`,
        method: 'GET',
      }),
      providesTags: (_, __, arg) => [{ type: 'Image', id: `${arg.ownerType}-${arg.ownerId}` }],
    }),

    // DELETE /api/Images/{imageId}
    deleteImage: build.mutation<void, number | string>({
      query: (imageId) => ({
        url: `/api/Images/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Image', id: 'LIST' }],
    }),
  }),
})

export const {
  useUploadImageMutation,
  useGetImagesByOwnerQuery,
  useDeleteImageMutation,
} = imagesApi
