import { baseApi } from './baseApi'

export type Weather = { date: string; temperatureC: number; summary: string }

export const demoApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getWeather: build.query<Weather[], void>({
      query: () => ({ url: '/weatherforecast' }),
      providesTags: ['Tag'],
    }),
  }),
})

export const { useGetWeatherQuery } = demoApi
