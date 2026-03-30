const TOKEN_STORAGE_KEY = "securedesk_token";
const USER_STORAGE_KEY = "securedesk_user";

export const getStoredSession = () => {
  if (typeof window === "undefined") {
    return {
      token: "",
      user: null,
    };
  }

  const token = localStorage.getItem(TOKEN_STORAGE_KEY) || "";
  const rawUser = localStorage.getItem(USER_STORAGE_KEY);

  if (!rawUser) {
    return {
      token,
      user: null,
    };
  }

  try {
    return {
      token,
      user: JSON.parse(rawUser),
    };
  } catch (error) {
    return {
      token,
      user: null,
    };
  }
};

export const saveSession = ({ token, user }) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};
