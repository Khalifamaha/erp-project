export function persistAuthSession(data) {
  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);
  if (data.user) {
    const userPayload = { ...data.user };
    if (data.employe) {
      userPayload.employe = data.employe;
    }
    localStorage.setItem("user", JSON.stringify(userPayload));
  }
}

export function getAuthErrorMessage(err, fallback = "Identifiants incorrects") {
  const data = err?.response?.data;
  if (!data) return fallback;
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.non_field_errors) && data.non_field_errors[0]) {
    return data.non_field_errors[0];
  }
  const firstField = Object.values(data).flat?.()?.[0];
  if (typeof firstField === "string") return firstField;
  return fallback;
}
