import { FETCH_USER, LOGOUT_USER } from '../constants/user'

export default function(state = null, action) {
  switch (action.type) {
    case FETCH_USER:
      return action.payload || false
    case LOGOUT_USER:
      return null
    default:
      return state
  }
}
