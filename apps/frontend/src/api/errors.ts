import axios from "axios";

type ApiErrorResponse = {
  success?: boolean;
  message?: string;
  code?: string;
  errors?: unknown;
};

const collectErrorMessages = (value: unknown): string[] => {
  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectErrorMessages(item));
  }

  if (typeof value === "object") {
    return Object.values(value).flatMap((item) => collectErrorMessages(item));
  }

  return [];
};

export const getApiErrorMessages = (
  error: unknown,
  fallbackMessage: string,
): string[] => {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return [fallbackMessage];
  }

  if (!error.response) {
    return [
      "Cannot connect to the backend. Make sure the backend server is running.",
    ];
  }

  const responseBody = error.response.data;
  const detailedMessages = collectErrorMessages(responseBody.errors);

  if (detailedMessages.length > 0) {
    return detailedMessages;
  }

  if (responseBody.message) {
    return [responseBody.message];
  }

  return [fallbackMessage];
};
