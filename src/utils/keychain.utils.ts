interface HiveKeychain {
  requestHandshake?: (callback: (response: any) => void) => void;
  requestSignBuffer?: (
    username: string,
    message: string,
    key: string,
    callback: (response: any) => void
  ) => void;
  requestBroadcast?: (
    account: string,
    operations: [string, object][],
    key: "Posting" | "Active" | "Memo",
    callback: (response: any) => void,
    rpc?: string
  ) => void;
  requestPost?: (
    account: string,
    title: string,
    body: string,
    parent_perm: string,
    parent_account: string | null,
    json_metadata: string,
    permlink: string,
    comment_options: string | null,
    callback: (response: any) => void,
    rpc?: string
  ) => void;
}

declare global {
  interface Window {
    hive_keychain?: HiveKeychain;
  }
}

/**
 * Verifica si Hive Keychain está instalado.
 */
function isKeychainInstalled(windowObj: Window): boolean {
  return typeof windowObj?.hive_keychain !== "undefined";
}

const requestBroadcast = (
  account: string,
  operations: [string, object][],
  key: "Posting" | "Active" | "Memo",
  callback: (response: any) => void,
  rpc?: string
): void => {
  if (isKeychainInstalled(window)) {
    window.hive_keychain!.requestBroadcast!(
      account,
      operations,
      key,
      callback,
      rpc
    );
  } else {
    console.error("Hive Keychain no está instalado.");
    callback({ success: false, message: "Hive Keychain is not installed." });
  }
};

const requestPost = (
  username: string,
  title: string,
  body: string,
  parent_perm: string,
  parent_username: string | null,
  json_metadata: string,
  permlink: string,
  comment_options: any,
  callback: (response: any) => void,
  rpc?: string
): void => {
  console.log({
    username,
    title,
    body,
    parent_perm,
    parent_username,
    json_metadata,
    permlink,
    comment_options,
  }); //TODO REM
  if (isKeychainInstalled(window)) {
    window.hive_keychain!.requestPost!(
      username,
      title,
      body,
      parent_perm,
      parent_username,
      json_metadata,
      permlink,
      comment_options,
      callback,
      rpc
    );
  } else {
    console.error("Hive Keychain no está instalado.");
    callback({ success: false, message: "Hive Keychain is not installed." });
  }
};

export const KeychainUtils = {
  isKeychainInstalled,
  requestBroadcast,
  requestPost,
};
