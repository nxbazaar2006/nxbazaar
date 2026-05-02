export type ActionResponse<T = null> =
  | {
      success: true;
      data: T;
      message?: string;
    }
  | {
      success: false;
      error: string;
      message?: string;
      data?: T;
    };
