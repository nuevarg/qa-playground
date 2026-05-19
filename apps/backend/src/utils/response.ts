export const successResponse = (message: string, data: unknown = null) => {
  return {
    success: true,
    message,
    data,
  };
};

export const errorResponse = (message: string, code: string) => {
  return {
    success: false,
    message,
    code,
  };
};
