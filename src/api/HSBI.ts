import { HSBI_API_URL } from "../config/constants";
import { BackendApi } from "./Backend";

export const HSBIApi = new BackendApi(HSBI_API_URL);
