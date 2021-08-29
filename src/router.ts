import { createRouter, createWebHistory } from 'vue-router'
import generatedRoutes from 'virtual:generated-pages'
import { setupLayouts } from 'virtual:generated-layouts'

const routes = setupLayouts(generatedRoutes)
const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach(async(to, from, next) => {
  // console.log('from:')
  // console.log(from)
  // console.log('to:')
  // console.log(to)
  // const loading = loadSpin.status
  // loadSpin.status = true
  // console.time(to.fullPath)
//   await userStore.refreshToken()
  // console.timeEnd(to.fullPath)
  // loadSpin.status = loadSpin.status && loading
  // next()
  // console.log(r)
  // console.log(userStore.isLoggedIn)
  // console.log(to.matched)
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // this route requires auth, check if logged in
    // if not, redirect to login page.
    // eslint-disable-next-line no-console
    console.log(`requiresAuth: ${to.fullPath}`)
    // if ()
    // else {
    next()
    // }
  }
  else {
    next() // make sure to always call next()!
  }
})

export { router, routes }

export default router
