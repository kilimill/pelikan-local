import {useStore} from 'vuex'

export default function useHelpers() {

  const store = useStore()

  const goToPlanner = () => {
    location.href = `${store.getters["application/hostInfo"]}/room/leave?backLink=${store.getters["application/backLink"]}`;
  }

  return {
    goToPlanner
  }
}