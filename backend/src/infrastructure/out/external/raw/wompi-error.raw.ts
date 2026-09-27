export interface WompiErrorRaw {
  error?: {
    type?: string;
    code?: string;
    message?: string;
    reason?: string;
  };
  data?: {
    status?: string;
  };
}
