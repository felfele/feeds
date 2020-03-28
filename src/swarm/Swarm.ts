
import { Debug } from '../helpers/Debug';
import { safeFetch } from '../helpers/safeFetch';

export const defaultGateway = 'https://swarm.felfele.org';
export const defaultPublicGateway = 'https://swarm-gateways.net';
export const defaultDebugGateway = 'http://localhost:8500';
export const defaultUrlScheme = '/bzz-raw:/';
export const defaultPrefix = 'bzz:/';
export const defaultFeedPrefix = 'bzz-feed:/';

export const upload = async (data: string, swarmGateway: string, headers?: {[key: string]: string}): Promise<string> => {
    try {
        swarmGateway = swarmGateway.endsWith('/')
            ? swarmGateway.substring(0, swarmGateway.length - 1)
            : swarmGateway
        ;
        const hash = await uploadString(data, swarmGateway, headers);
        Debug.log('upload', {hash});
        return swarmGateway + '/' + defaultPrefix + hash + '/';
    } catch (e) {
        Debug.log('upload:', {e});
        throw e;
    }
};

const uploadString = async (data: string, swarmGateway: string, headers?: {[key: string]: string}): Promise<string> => {
    Debug.log('uploadString', {data});
    const url = swarmGateway + '/bzz:/';
    const options: RequestInit = {
        headers: headers ?? {
            'Content-Type': 'text/plain',
        },
        method: 'POST',
    };
    options.body = data;
    Debug.log('uploadString', {url});
    const response = await safeFetch(url, options);
    const text = await response.text();
    return text;
};
