declare module "*.css";

declare namespace NodeJS {
  interface ProcessEnv {
    readonly REACT_APP_DEV?: string;
    readonly REACT_APP_BE_API_URL?: string;
  }
}
