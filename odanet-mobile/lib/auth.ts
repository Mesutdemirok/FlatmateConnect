import * as SecureStore from "expo-secure-store";

export async function setToken(t: string) {
  await SecureStore.setItemAsync("token", t);
}

export async function getToken() {
  return SecureStore.getItemAsync("token");
}

export async function clearToken() {
  await SecureStore.deleteItemAsync("token");
}