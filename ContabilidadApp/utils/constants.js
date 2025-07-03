import getConfig from "next/config";
const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();

export const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || serverRuntimeConfig.apiURL || publicRuntimeConfig.apiURL;
export const API_URL = DOMAIN + '/api/';