import { baseApi } from './baseApi'
import type { Image, UploadImageResponse } from '../types/images'

export const imagesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // POST /api/Images (multipart upload)
    uploadImage: build.mutation<
      UploadImageResponse,
      { file: File; ownerId: number | string; ownerType: string }
    >({
      query: ({ file, ownerId, ownerType }) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('ownerId', String(ownerId))
        formData.append('ownerType', ownerType)
        return {
          url: '/api/Images',
          method: 'POST',
          body: formData,
        }
      },
      invalidatesTags: (_, __, arg) => [{ type: 'Image', id: `${arg.ownerType}-${arg.ownerId}` }],
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
