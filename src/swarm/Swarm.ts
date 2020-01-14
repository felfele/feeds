
import { Debug } from '../Debug';
import { safeFetch } from '../Network';

export const defaultGateway = 'https://swarm.felfele.com';
export const defaultPublicGateway = 'https://swarm-gateways.net';
export const defaultDebugGateway = 'http://localhost:8500';
export const defaultUrlScheme = '/bzz-raw:/';
export const defaultPrefix = 'bzz:/';
export const defaultFeedPrefix = 'bzz-feed:/';

export const upload = async (data: string, swarmGateway: string): Promise<string> => {
    try {
        const hash = await uploadString(data, swarmGateway);
        Debug.log('upload', {hash});
        return hash;
    } catch (e) {
        Debug.log('upload:', {e});
        throw e;
    }
};

const uploadString = async (data: string, swarmGateway: string): Promise<string> => {
    Debug.log('uploadString', {data});
    const url = swarmGateway + '/bzz:/';
    const options: RequestInit = {
        headers: {
            'Content-Type': 'text/plain',
        },
        method: 'POST',
    };
    options.body = data;
    const response = await safeFetch(url, options);
    const text = await response.text();
    return text;
};
