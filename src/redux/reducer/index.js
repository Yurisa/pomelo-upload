const menuReducer = (state, { type, payload }) => {
  switch (type) {
    case type.SWITCH_MENU:
      return {
        ...state,
        menuName: payload
      };
    default:
      return { ...state };
  }
};

export default menuReducer;