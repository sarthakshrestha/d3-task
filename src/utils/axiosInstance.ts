import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";

const axiosInstance: AxiosInstance = axios.create({
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Req interceptor
axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Error logs
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      console.error("API Error Response:", error.response.data);
      console.error("Status:", error.response.status);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Request error:", error.message);
    }
    return Promise.reject(error);
  }
);

// World Bank API methods
export const worldBankAPI = {
  getIndicator: async (
    countryCode: string,
    indicatorCode: string,
    year: string
  ): Promise<AxiosResponse> => {
    return axiosInstance.get(
      `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicatorCode}?date=${year}&format=json`
    );
  },
};

export default axiosInstance;
