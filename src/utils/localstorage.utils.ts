const LOCAL_STORAGE_KEY = "hiveUsernames";
const MAX_SAVED_USERNAMES = 10;

function getSavedUsernames(): string[] {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (item) {
      try {
        const usernames = JSON.parse(item);
        if (Array.isArray(usernames)) {
          return usernames.filter((name: any) => typeof name === "string");
        }
      } catch (e) {
        return item
          .split(",")
          .map((name) => name.trim())
          .filter((name) => name !== "");
      }
    }
  } catch (e) {
    console.error("Could not read from localStorage:", e);
  }
  return [];
}

function saveUsername(username: string): void {
  if (!username || typeof username !== "string") return;

  try {
    let usernames = getSavedUsernames();
    usernames = usernames.filter((name) => name !== username);
    usernames.unshift(username);
    usernames = usernames.slice(0, MAX_SAVED_USERNAMES);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(usernames));
  } catch (e) {
    console.error("Could not write to localStorage:", e);
  }
}

export const LocalStorageUtils = {
  saveUsername,
  getSavedUsernames,
};
