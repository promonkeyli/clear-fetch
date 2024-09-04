/**
 * @typedef {object} Config
 * @property {string} baseUrl - The request url prefix.
 * @property {number} timeout - The request timeout period.
 */

/**
 * @typedef {object} Create
 * @property {Promise<Response>} request - The request instance.
 * @property {function} useReqInterceptor - The request interceptor.
 * @property {function} useResInterceptor - The response interceptor.
 */

/**
 * @typedef {Object} RequestInterceptor
 * @property {(config: RequestInit) => RequestInit | Promise<RequestInit>} [onFulfilled] - Function to handle request configuration before the request is sent.
 * @property {(error: any) => any} [onRejected] - Function to handle errors that occur during request interception.
 */

/**
 * @typedef {Object} ResponseInterceptor
 * @property {(response: Response) => Response | Promise<Response>} [onFulfilled] - Function to handle response before it is returned.
 * @property {(error: any) => any} [onRejected] - Function to handle errors that occur during response interception.
 */

/**
 * @desc Create a request instance on fetch.
 * @param {Config} [config] - Global config.
 * @returns {Create}
 */
function Create(config){
    const baseUrl = config?.baseUrl || "";
    const timeout = config?.timeout || 5000;
    /** @type {RequestInterceptor[]} */
    const reqInterceptor = []
    /** @type {ResponseInterceptor[]} */
    const resInterceptor = []

    /**
     * Add a request interceptor.
     * @param {(config: RequestInit) => RequestInit | Promise<RequestInit>} [onFulfilled] - Function to handle request configuration.
     * @param {(error: any) => any} [onRejected] - Function to handle errors during request interception.
     */
    const useReqInterceptor = (onFulfilled, onRejected) => {
        reqInterceptor.push({onFulfilled, onRejected})
    }

    /**
     * Add a response interceptor.
     * @param {(response: Response) => Response | Promise<Response>} [onFulfilled] - Function to handle response data.
     * @param {(error: any) => any} [onRejected] - Function to handle errors during response interception.
     */
    const useResInterceptor = (onFulfilled, onRejected) => {
        resInterceptor.push({onFulfilled, onRejected})
    }

    const controller = new AbortController();
    const { signal } = controller;
    const timeId = setTimeout(() => controller.abort(), timeout);

    /**
     * @desc request func.
     * @param {string} url - The request url.
     * @param {RequestInit} [options] - The request options.
     * @returns {promise<Response>} - The fetch response.
     */
    const request = async (url, options) => {
        let newOptions = {
            ...options,
            baseUrl,
            timeout,
            url
        }
        // apply request interceptor
        for (const interceptor of reqInterceptor) {
            if (interceptor.onFulfilled) {
                try {
                    newOptions = await interceptor.onFulfilled(newOptions);
                } catch (error) {
                    if (interceptor.onRejected) {
                        interceptor.onRejected(error);
                    }
                    return Promise.reject(error);
                }
            }
        }


        const fullUrl = `${baseUrl}${url}`

        try {
            // fetch add timeout logic
            let response = await fetch(fullUrl, { ...newOptions, signal}).then(r => r.json())
                .then((r) => {
                    clearTimeout(timeId);
                    return r;
                }) ;

            // Apply response interceptors
            for (const interceptor of resInterceptor) {
                if (interceptor.onFulfilled) {
                    try {
                        response = await interceptor.onFulfilled(response);
                    } catch (error) {
                        if (interceptor.onRejected) {
                            return interceptor.onRejected(error);
                        }
                        return Promise.reject(error);
                    }
                }
            }

            return response

        }catch (error) {
            // Handle timeout error
            if (error.name === "AbortError") {
                throw new Error("请求超时！");
            }
            // Handle errors during the request
            for (const interceptor of resInterceptor) {
                if (interceptor.onRejected) {
                    interceptor.onRejected(error);
                }
            }
            return Promise.reject(error);
        }
    }

    return {
        request,
        useReqInterceptor,
        useResInterceptor,
    }

}

export default Create
