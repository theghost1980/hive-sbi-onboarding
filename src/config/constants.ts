export const beBaseUrl = process.env.REACT_APP_DEV
  ? "http://localhost:4000"
  : process.env.REACT_APP_BE_API_URL;
export const VERIFY_USER_ROUTE = "/auth/verify";
export const GET_CHALLENGE_ROUTE = "/auth/challenge";
export const JWT_TOKEN_STORAGE_KEY = "jwt_token";
export const HSBI_API_URL = "https://api.hivesbi.com";
export const HSBI_API_MEMBERS_EP = "/v1/members/";
export const BE_ONBOARDED_BY_USERNAME_EP = "/query/onboarded-by-username";
export const BE_GET_ALL_ONBOARDED_EP = "/query/getAll";
export const BE_ADD_ONBOARDING = "/crud/add";
export const BE_EDIT_ONBOARDING = "/crud/edit";
