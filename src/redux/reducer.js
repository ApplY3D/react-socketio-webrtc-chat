import * as actions from "./actions";

const initialState = {
  joined: false,
  roomId: "",
  userName: "",
  userId: "",
  users: [],
  messages: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actions.SEND_MESSAGE:
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            userId: action.payload.userId,
            userName: action.payload.userName,
            text: action.payload.text,
            time: action.payload.time,
          },
        ],
      };
    case actions.SET_DATA:
      return {
        ...state,
        users: action.payload.users,
        messages: action.payload.messages,
        roomId: action.payload.roomId,
      };
    case actions.SET_USERS:
      return {
        ...state,
        users: action.payload.users,
      };
    case actions.SET_ID:
      return {
        ...state,
        userId: action.payload,
      };
    case actions.ADD_NAME:
      return {
        ...state,
        joined: true,
        userName: action.payload.userName,
      };
    default:
      return state;
  }
}
