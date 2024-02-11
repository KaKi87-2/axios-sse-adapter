import buildURL from 'axios/lib/helpers/buildURL.js';
import buildFullPath from 'axios/lib/core/buildFullPath.js';
import AxiosError from 'axios/lib/core/AxiosError.js';
import settle from 'axios/lib/core/settle.js';

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