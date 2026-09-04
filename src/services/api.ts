import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";

interface GenericResponse<T = any> {
  success: boolean;
  status?: number;
  returnCode?: number;
  message?: string;
  returnMessage?: string;
  data?: T;
  returnData?: T;
}

// Backend origin used for all API calls.
// Resolution order (highest priority first):
//   1. VITE_API_URL — explicit override via .env / CI / runtime (recommended)
//   2. Local dev backend while running `npm run dev` / `vite` (Vite sets DEV=true)
//   3. Production backend (deployed / preview / production builds)
const getBaseURL = () => {
  const configured = import.meta.env.VITE_API_URL;
  if (configured) return configured.replace(/\/+$/, "");

  if (import.meta.env.DEV) {
    return "http://localhost:5001";
  }
  return "https://exegesisbackend-production.up.railway.app";
};

const BASE_URL = getBaseURL();

// Visible in the browser console + on-screen so it's never ambiguous where
// requests are going (dev vs production). Useful for the "wrong backend" bug.
export const API_BASE_URL = BASE_URL;
export const TOKEN_KEY = "auth_token";
export const USER_KEY = "user_data";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Throttle for the "subscription expired" prompt (ms). Prevents a storm of
// toasts/redirects when several gated requests fail at once, while still
// reminding the user again if they ignore the prompt.
const SUBSCRIPTION_EXPIRED_COOLDOWN_MS = 90000;
let lastSubscriptionExpiredAt = 0;

// Request interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("🚀 Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse<GenericResponse>) => {
    const data = response.data;
    // Skip binary responses (ArrayBuffer, Blob) — the interceptor
    // would otherwise corrupt them by writing JSON properties onto the buffer.
    if (data instanceof ArrayBuffer || data instanceof Blob) {
      return response;
    }
    if (data.returnCode === undefined) {
      data.returnCode = data.status ?? (data.success ? 200 : 400);
      data.returnMessage = data.returnMessage ?? data.message ?? "";
      if (data.returnData === undefined && data.data !== undefined) {
        data.returnData = data.data;
      }
    }
    return response;
  },
  (error) => {
    const responseData = error.response?.data;
    if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
      responseData.returnCode =
        responseData.returnCode ??
        responseData.status ??
        error.response?.status ??
        500;
      responseData.returnMessage =
        responseData.returnMessage ?? responseData.message ?? error.message;
      if (
        responseData.returnData === undefined &&
        responseData.data !== undefined
      ) {
        responseData.returnData = responseData.data;
      }
    }
    const originalRequest = error.config;
    const hasToken = originalRequest?.headers?.Authorization;
    if (error.response?.status === 401 && hasToken) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      console.error("Session Expired. Please login again.");
      window.dispatchEvent(new CustomEvent("session-expired"));
    }
    // Detect an expired subscription (backend returns 403 "Subscription expired"
    // from requireTier). Fire a global event once per cooldown window so the app
    // can notify the user and redirect them back to the subscription page.
    const isExpired =
      responseData &&
      (responseData.returnCode === 403 || responseData.status === 403) &&
      typeof responseData.returnMessage === "string" &&
      /expired/i.test(responseData.returnMessage);
    const now = Date.now();
    if (
      isExpired &&
      hasToken &&
      now - lastSubscriptionExpiredAt > SUBSCRIPTION_EXPIRED_COOLDOWN_MS
    ) {
      lastSubscriptionExpiredAt = now;
      window.dispatchEvent(new CustomEvent("subscription-expired", { detail: responseData }));
    }
    return Promise.reject(error);
  },
);

/**
 * Custom error class that includes backend returnMessage
 */export class ApiError extends Error {
  constructor(
    message: string,
    public returnCode?: number,
    public returnMessage?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Generic POST request function
 * @param controller Controller name (e.g., 'auth')
 * @param request Request name (e.g., 'login')
 * @param data Request body (default empty object)
 * @returns GenericResponse
 */
export const sendPostRequest = async <T = any>(
  controller: string,
  request: string,
  data: object = {},
): Promise<GenericResponse<T>> => {
  try {
    const lang = localStorage.getItem("exegesis-language") || "en";
    const response = await api.post<GenericResponse<T>>(
      `/${controller}/${request}`,
      { ...data, lang },
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const serverResponse = error.response.data;
      if (serverResponse && serverResponse.returnCode !== undefined) {
        return serverResponse;
      }
    }
    const serverResponse = error.response?.data;
    const serverMessage =
      serverResponse?.returnMessage ?? serverResponse?.message ?? error.message;
    const serverCode = serverResponse?.returnCode ?? serverResponse?.status;
    console.error(`❌ POST ${controller}/${request} failed`, serverMessage);
    return { returnCode: serverCode || 500, returnMessage: serverMessage, success: false };
  }
};

/**
 * Generic GET request function
 */
export const sendGetRequest = async <T = any>(
  controller: string,
  request: string,
  params?: object,
): Promise<GenericResponse<T>> => {
  try {
    const response = await api.get<GenericResponse<T>>(
      `/${controller}/${request}`,
      { params },
    );
    return response.data;
  } catch (error: any) {
    const serverResponse = error.response?.data;
    const serverMessage =
      serverResponse?.message ?? serverResponse?.returnMessage ?? error.message;
    const serverCode = serverResponse?.status ?? serverResponse?.returnCode;
    console.error(`❌ GET ${controller}/${request} failed`, serverMessage);
    throw new ApiError(serverMessage, serverCode, serverMessage);
  }
};

export default api;
