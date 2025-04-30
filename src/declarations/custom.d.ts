declare module "*.css";

declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.jpeg" {
  const value: string;
  export default value;
}

declare module "*.gif" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly REACT_APP_DEV?: string;
    readonly REACT_APP_BE_API_URL?: string;
  }
}
