function generateRandomString(
  length: number,
  includeTimestamp: boolean
): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return (
    result.toLowerCase() + (includeTimestamp ? "-" + Date.now().toString() : "")
  );
}

export const PermlinkUtils = {
  generateRandomString,
};
