interface HiveKeychain {
  requestHandshake?: (callback: (response: any) => void) => void;
  requestSignBuffer?: (
    username: string,
    message: string,
    key: string,
    callback: (response: any) => void
  ) => void;
}

declare global {
  interface Window {
    hive_keychain?: HiveKeychain;
  }
}

/**
 * Verifica si la extensión Hive Keychain está instalada y disponible en el navegador.
 * Asume que la API de Keychain se expone en window.hive_keychain.
 *
 * @param windowObj El objeto global window del navegador.
 * @returns true si Keychain se encuentra, false de lo contrario.
 */
function isKeychainInstalled(windowObj: Window): boolean {
  if (windowObj && typeof windowObj.hive_keychain !== "undefined") {
    return true;
  }
  return false;
}

export const KeychainUtils = {
  isKeychainInstalled,
};
