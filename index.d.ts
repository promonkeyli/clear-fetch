interface Config {
    baseUrl: string;
    timeout: number;
}
interface Create {
    request: (url: string, options?: RequestInit) => Promise<Response>;
    useReqInterceptor: (onFulfilled?: (config: RequestInit) => RequestInit | Promise<RequestInit>, onRejected?: (error: any) => any) => void;
    useResInterceptor: (onFulfilled?: (response: Response) => Response | Promise<Response>, onRejected?: (error: any) => any) => void;
}
interface RequestInterceptor {
    onFulfilled?: (config: RequestInit) => RequestInit | Promise<RequestInit>;
    onRejected?: (error: any) => any;
}
interface ResponseInterceptor {
    onFulfilled?: (response: Response) => Response | Promise<Response>;
    onRejected?: (error: any) => any;
}
declare function Create(config?: Config): Create;

export default Create;
