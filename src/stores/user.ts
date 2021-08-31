import { ref, computed } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'
import Cookies from 'js-cookie'

export const useUserStore = defineStore('user', () => {
  /**
   * Current named of the user.
   */

  // store/use-user-store.ts

  const savedName = ref('')
  const accessToken = ref('')
  const previousNames = ref(new Set<string>())
  const prevTokens = ref(new Set<string>())

  const usedNames = computed(() => Array.from(previousNames.value))
  const otherNames = computed(() => usedNames.value.filter(name => name !== savedName.value))

  // import Cookies from 'js-cookie'
  /**
   * Changes the current name of the user and saves the one that was used
   * before.
   */
  accessToken.value = Cookies.get('accessToken')
  savedName.value = Cookies.get('userName')

  /**
   * Changes the current name of the user and saves the one that was used
   * before.
   *
   * @param name - new name to set
   */
  function setNewName(name: string) {
    if (savedName.value)
      previousNames.value.add(savedName.value)

    savedName.value = name
    Cookies.set('userName', savedName.value.value, { expires: 3 })
  }

  function setAccessToken(token: string) {
    if (accessToken.value)
      prevTokens.value.add(accessToken.value)

    accessToken.value = token
    Cookies.set('accessToken', accessToken.value, { expires: 3 })
  }

  return {
    setNewName,
    otherNames,
    savedName,
    accessToken,
    setAccessToken,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
