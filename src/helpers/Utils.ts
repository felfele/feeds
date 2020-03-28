const clearTimeoutIfSet = (t: any) => {
    if (t != null) {
        clearTimeout(t);
    }
};

export const timeout = async <T>(ms: number, promise: Promise<T>): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
        const t = ms > 0
            ? setTimeout(() => {
                reject(new Error('timeout'));
            }, ms)
            : undefined
        ;
        promise.then((value) => {
            clearTimeoutIfSet(t);
            resolve(value);
        }, (reason) => {
            clearTimeoutIfSet(t);
            reject(reason);
        });
    });
};

export const waitMillisec = async (ms: number): Promise<number> => {
    return new Promise<number>((resolve, reject) => {
        if (ms > 0) {
            setTimeout(() => resolve(ms), ms);
        }
    });
};

export const isNodeJS = () => {
    return typeof process === 'object'
        && typeof process.versions === 'object'
        && typeof process.versions.node !== 'undefined';
};
