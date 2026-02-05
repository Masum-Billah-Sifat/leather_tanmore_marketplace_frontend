import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    _skipAuthHeader?: boolean;
  }
}
