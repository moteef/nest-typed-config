import { MetadataStorage } from 'class-transformer/types/MetadataStorage';
import configurationHolder from './configuration-holder';
import { applyDecorators } from '@nestjs/common';
import {
  ClassConstructor,
  Expose,
  plainToClass,
  Transform,
  Type,
} from 'class-transformer';

/* eslint @typescript-eslint/no-var-requires: "off" */
const defaultMetadataStorage: MetadataStorage = require('class-transformer/cjs/storage')
  .defaultMetadataStorage;

export function FromConfig(key: string): PropertyDecorator {
  const configurationDecorator = (
    target: any,
    propertyName: string | symbol,
  ): void => {
    configurationHolder.register(
      target.constructor,
      propertyName as string,
      key,
    );
    defaultMetadataStorage.addTransformMetadata({
      target: target.constructor,
      propertyName: propertyName as string,
      transformFn: () => {
        const res = configurationHolder.resolve(
          target.constructor,
          propertyName as string,
        );
        return res;
      },
      options: {},
    });
  };
  return applyDecorators(configurationDecorator, Expose());
}

export function NestedConfig(
  type: ClassConstructor<unknown>,
): PropertyDecorator {
  const decorator = Transform(({ value, options }) => {
    if (value instanceof type) {
      return value;
    }
    return plainToClass(type, value || {}, options);
  });
  return applyDecorators(
    decorator,
    Expose(),
    Type(() => type),
  );
}
