import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  timeout: 5000,
  // headers: {
  //   'X-Auth-Token': 'f2b6637ddf355a476918940289c0be016a4fe99e3b69c83d',
  //   'Content-Type': 'application/json'
  // }
})

// https://thedutchlab.com/blog/using-axios-interceptors-for-refreshing-your-api-token
// Request interceptor for API calls
instance.interceptors.request.use(
  async(config) => {
    //   const jwToken = userStore.state.accessToken
    //   if (jwToken) {
    //       config.headers.Authorization = `Bearer ${jwToken}`
    //     }
    // eslint-disable-next-line no-console
    console.log(config)
    return config
  },
  (error) => {
    Promise.reject(error)
  },
)

// Response interceptor for API calls
instance.interceptors.response.use((response) => {
  // console.log(response)
  return response
}, async(error) => {
  const originalRequest = error.config
  if (error.response.status === 403 && !originalRequest._retry) {
    originalRequest._retry = true
    //   const access_token = await refreshAccessToken();
    //   axios.defaults.headers.common['Authorization'] = 'Bearer ' + access_token;
    return instance(originalRequest)
  }
  return Promise.reject(error)
})

export default instance
