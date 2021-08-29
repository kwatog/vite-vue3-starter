<template>
  <section class="text-gray-600 body-font">
    <div class="container px-5 py-24 mx-auto flex flex-wrap">
      <div class="hidden md:block md:w-1/2 w-full mb-10 lg:mb-0 rounded-lg overflow-hidden">
        <img
          alt="feature"
          class="object-cover object-center h-full w-full"
          src="https://source.unsplash.com/random"
        >
      </div>
      <div class="flex flex-col flex-wrap lg:py-6 -mb-10 md:w-1/2 lg:pl-12 lg:text-left text-center mx-auto">
        <div class="flex flex-col mb-10 md:items-start items-center">
          <div class="w-full h-100">
            <h1 class="text-xl md:text-2xl font-bold leading-tight mt-12">
              Log in to your account
            </h1>

            <form class="md:mt-6" action="#" method="POST">
              <div>
                <label class="block text-gray-700">Email Address</label>
                <input
                  id="email"
                  v-model="state.username"
                  type="email"
                  name=""
                  placeholder="Enter Email Address"
                  class="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none"
                  autofocus
                  autocomplete
                  required
                >
              </div>

              <div class="mt-4">
                <label class="block text-gray-700">Password</label>
                <input
                  id="password"
                  v-model="state.password"
                  type="password"
                  name=""
                  placeholder="Enter Password"
                  minlength="6"
                  class="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-blue-500
                        focus:bg-white focus:outline-none"
                  required
                >
              </div>

              <div class="text-right mt-2">
                <a href="#" class="text-sm font-semibold text-gray-700 hover:text-blue-700 focus:text-blue-700">Forgot Password?</a>
              </div>

              <button
                type="submit"
                class="w-full block bg-indigo-500 hover:bg-indigo-400 focus:bg-indigo-400 text-white font-semibold rounded-lg
                        px-4 py-3 mt-6"
                @click.prevent="doLogin()"
              >
                Log In
              </button>
            </form>

            <hr class="my-6 border-gray-300 w-full">

            <button type="button" class="w-full block bg-white hover:bg-gray-100 focus:bg-gray-100 text-gray-900 font-semibold rounded-lg px-4 py-3 border border-gray-300">
              <div class="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="w-6 h-6" viewBox="0 0 48 48"><defs><path id="a" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" /></defs><clipPath id="b"><use xlink:href="#a" overflow="visible" /></clipPath><path clip-path="url(#b)" fill="#FBBC05" d="M0 37V11l17 13z" /><path clip-path="url(#b)" fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z" /><path clip-path="url(#b)" fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z" /><path clip-path="url(#b)" fill="#4285F4" d="M48 48L17 24l-4-3 35-10z" /></svg>
                <span class="ml-4">
                  Log in
                  with
                  Google</span>
              </div>
            </button>

            <p class="mt-8">
              Need an account? <a href="#" class="text-blue-500 hover:text-blue-700 font-semibold">Create an
                account</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from '../utils/api'
// import axios from 'axios'

import { useUserStore } from '~/stores/user'
// const props = defineProps<{ name: string }>()
const router = useRouter()
const user = useUserStore()
// const { t } = useI18n()

const state = reactive({
  username: '',
  password: '',
})

function doLogin() {
  const params = new URLSearchParams()
  params.append('username', state.username)
  params.append('password', state.password)
  params.append('grant_type', 'password')
  params.append('scope', 'me')

  const config = {
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }

  axios.post('/token', params, config)
    .then((res) => {
      // eslint-disable-next-line no-console
      // console.log(res.data)
      user.setNewName(state.username)
      user.setAccessToken(res.data.access_token)
      router.push('/')
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err.message)
    })
}

</script>
<route lang="yaml">
meta:
  layout: plain
</route>
