import buildURL from 'axios/unsafe/helpers/buildURL.js';
import buildFullPath from 'axios/unsafe/core/buildFullPath.js';
import AxiosError from 'axios/unsafe/core/AxiosError.js';
import settle from 'axios/unsafe/core/settle.js';

export default ({
    EventSource = typeof window === 'undefined' ? undefined : window.EventSource,
    onMessage
}) => config => new Promise((resolve, reject) => {
    const
        url = buildURL(buildFullPath(config.baseURL, config.url), config.params, config.paramsSerializer),
        eventSource = new EventSource(url);
    eventSource.addEventListener(
        'error',
        error => {
            throw new AxiosError(
                error.message,
                error.code,
                config,
                eventSource,
                error
            );
        }
    );
    eventSource.addEventListener(
        'open',
        () => settle(
            resolve,
            reject,
            {
                config,
                request: eventSource
            }
        )
    );
    eventSource.addEventListener(
        'message',
        event => onMessage(
            config.responseType === 'json'
                ? JSON.parse(event.data)
                : event.data,
            event
        )
    );
});