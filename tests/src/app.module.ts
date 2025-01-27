import { DynamicModule, Module } from '@nestjs/common';
import { join } from 'path';
import { parse as parseYaml } from 'yaml';
import {
  remoteLoader,
  RemoteLoaderOptions,
  TypedConfigModule,
} from '../../lib';
import { fileLoader } from '../../lib';
import {
  dotenvLoader,
  DotenvLoaderOptions,
} from '../../lib/loader/dotenv-loader';
import { Config, TableConfig } from './config.model';

const loadYaml = function loadYaml(filepath: string, content: string) {
  try {
    const result = parseYaml(content);
    return result;
  } catch (error) {
    error.message = `YAML Error in ${filepath}:\n${error.message}`;
    throw error;
  }
};

@Module({})
export class AppModule {
  static withMultipleLoaders(
    loaderTypes: ('reject' | 'part1' | 'part2')[],
    async = true,
  ): DynamicModule {
    const loaders = loaderTypes.map(type => {
      if (type === 'reject') {
        return () => {
          throw new Error('Not found');
        };
      }
      if (type === 'part1') {
        return fileLoader({
          searchFrom: __dirname,
          basename: '.env.part1',
        });
      }
      if (type === 'part2') {
        return fileLoader({
          searchFrom: __dirname,
          basename: '.env.part2',
        });
      }
      throw new Error('not valid type');
    });
    return {
      module: AppModule,
      imports: [
        TypedConfigModule[async ? 'forRootAsync' : 'forRoot']({
          schema: Config,
          load: loaders,
        }),
      ],
    };
  }

  static withToml(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        TypedConfigModule.forRoot({
          schema: Config,
          load: fileLoader({
            absolutePath: join(__dirname, '.env.toml'),
          }),
        }),
      ],
    };
  }

  static withRawModule(): DynamicModule {
    return TypedConfigModule.forRoot({
      schema: Config,
      load: fileLoader({
        absolutePath: join(__dirname, '.env.toml'),
      }),
    });
  }

  static withSpecialFormat(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        TypedConfigModule.forRoot({
          schema: Config,
          load: fileLoader({
            basename: '.config',
            loaders: {
              '.special': loadYaml,
            },
            searchFrom: __dirname,
          }),
        }),
      ],
    };
  }

  static withErrorToml(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        TypedConfigModule.forRoot({
          schema: Config,
          load: fileLoader({
            absolutePath: join(__dirname, '.env.error.toml'),
          }),
        }),
      ],
    };
  }

  static withStringConfig(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        TypedConfigModule.forRootAsync({
          schema: Config,
          load: () => 'string' as any,
        }),
      ],
    };
  }

  static withConfigNotFound(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        TypedConfigModule.forRoot({
          schema: Config,
          load: fileLoader(),
        }),
      ],
    };
  }

  static withValidationFailed(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        TypedConfigModule.forRoot({
          schema: Config,
          load: fileLoader({
            absolutePath: join(__dirname, '.env.invalid.toml'),
          }),
        }),
      ],
    };
  }

  static withNodeEnv(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        TypedConfigModule.forRoot({
          schema: Config,
          load: fileLoader({
            searchFrom: __dirname,
          }),
        }),
      ],
    };
  }

  static withDotenvNoOption(): DynamicModule {
    return {
      module: AppModule,
      imports: [
        TypedConfigModule.forRoot({
          schema: TableConfig,
          load: dotenvLoader(),
        }),
      ],
    };
  }

  static withDotenv(option?: DotenvLoaderOptions): DynamicModule {
    return {
      module: AppModule,
      imports: [
        TypedConfigModule.forRoot({
          schema: Config,
          load: dotenvLoader(option),
          validationOptions: {
            forbidNonWhitelisted: false,
          },
          normalize(config) {
            config.isAuthEnabled = config.isAuthEnabled === 'true';
            config.database.port = parseInt(config.database.port, 10);
            return config;
          },
        }),
      ],
    };
  }

  static withRemoteConfig(loaderOptions?: RemoteLoaderOptions): DynamicModule {
    return {
      module: AppModule,
      imports: [
        TypedConfigModule.forRootAsync({
          schema: Config,
          load: remoteLoader('http://localhost', loaderOptions),
        }),
      ],
    };
  }
}
