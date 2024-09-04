## A clear fetch library

* Example

```js
import useUserStore from "@/stores/auth/user";
import Create from "clear-fetch";

const TOKEN_BLACK_LIST = ["/login"];

const instance = Create({
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL as string,
  timeout: 3000,
});

instance.useReqInterceptor(
  (config: any) => {
    const isAddToken = !TOKEN_BLACK_LIST.includes(config.url as string);
    if (isAddToken) {
      const { token } = useUserStore.getState();
      (config.headers as any)["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  },
);

instance.useResInterceptor(
  (response: any) => {
    // 没有授权直接跳转login
    return response;
  },
  (error: any) => {
    return Promise.reject(error);
  },
);

export default instance.request;
```

