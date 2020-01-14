import { Utils } from './Utils';

export const safeFetch = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    const response = await fetch(input, init);
    if (!response.ok) {
        throw new Error('Network error: ' + response.status + ', text: ' + response.statusText + ', request: ' + input.toString());
    }
    return response;
};

export const safeFetchWithTimeout = async (input: RequestInfo, init?: RequestInit, timeout: number = 0): Promise<Response> => {
    return await Utils.timeout(timeout, safeFetch(input, init));
};

export const safeFetchWithFollow = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    let response = await fetch(input, {...init, redirect: 'manual'});
    console.log('safeFetchWithFollow', {input, response, redirected: response.redirected});
    let numTries = 0;
    const maxTries = 10;
    const isFoundRedirected = (resp: Response) => resp.status >= 300 && resp.status < 400;
    const isRedirected = (resp: Response) => resp.redirected || isFoundRedirected(resp);
    while (isRedirected(response) && numTries < maxTries) {
        const redirectedUrl = isFoundRedirected(response)
            ? response.headers.get('location') ?? ''
            : response.url
        ;
        response = await fetch(redirectedUrl, {...init, redirect: 'manual'});
        numTries += 1;
        console.log('safeFetchWithFollow', {redirectedUrl, response});
    }
    return response;
};
