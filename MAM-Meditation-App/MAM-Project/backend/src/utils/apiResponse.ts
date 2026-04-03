export const success = (data: unknown, meta?: unknown) => ({
  success: true, data, error: null, meta
});
export const error = (code: string, message: string, status: number) => ({
  success: false, data: null, error: { code, message }, meta: null
});
