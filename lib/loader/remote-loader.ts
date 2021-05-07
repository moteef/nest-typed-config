import { parse as parseToml } from '@iarna/toml';
import axios, { AxiosRequestConfig } from 'axios';
import { identity } from 'lodash';
import parseJson from 'parse-json';
import { parse as parseYaml } from 'yaml';

type AxiosRequestConfigWithoutUrl = Omit<AxiosRequestConfig, 'url'>;

export type RemoteLoaderConfigType = 'json' | 'yaml' | 'toml';

export interface RemoteLoaderOptions extends AxiosRequestConfigWithoutUrl {
  /**
   * Config file type
   */
  type?: RemoteLoaderConfigType;
  /**
   * A function that maps http response body to corresponding config object
   */
  mapResponse?: (config: any) => Promise<any> | any;
}

/**
 * Async loader loads configuration at remote endpoint.
 *
 * @param url Remote location of configuration
 * @param options options to configure async loader, support all `axios` options
 */
export const remoteLoader = (
  url: string,
  options: RemoteLoaderOptions = {},
) => {
  return async (): Promise<any> => {
    const instance = axios.create();
    const response = await instance.request({
      url,
      ...options,
    });
    const { mapResponse = identity, type } = options;
    const config = await mapResponse(response.data);
    const parser = {
      json: (content: string) => parseJson(content),
      yaml: (content: string) => parseYaml(content),
      toml: (content: string) => parseToml(content),
    };

    if (typeof config === 'string' && type && parser[type]) {
      return parser[type](config);
    }

    return config;
  };
};
