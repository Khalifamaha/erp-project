import client from "./client";

export const login = async (credentials) => {
  const { data } = await client.post("/auth/login/", credentials);
  return data;
};

export const loginEmploye = async (credentials) => {
  const { data } = await client.post("/auth/login-employe/", credentials);
  return data;
};

export const logout = async () => {
  const refreshToken = localStorage.getItem("refresh_token");
  await client.post("/auth/logout/", { refresh: refreshToken });
};

export const getMe = async () => {
  const { data } = await client.get("/auth/me/");
  return data;
};