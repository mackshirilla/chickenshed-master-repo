// src/api/apiConfig.ts

import { AxiosClient, AxiosClientConfigurator } from "@xatom/axios";
import { authManager } from "../auth/authConfig";

// Configure AxiosClient with the base API URL
const axiosConfigurator = new AxiosClientConfigurator(
  "https://xszy-vp96-kdkh.n7c.xano.io/api:QwHbGu7r"
);

// Add Authorization header before each request
axiosConfigurator.beforeRequest((config, nextFn) => {
  const token = authManager.getUserAuth().getConfig().token; // Get token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  nextFn(config); // Proceed with the request
});

export const apiClient = new AxiosClient(axiosConfigurator);
