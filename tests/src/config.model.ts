import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsInt,
  IsString,
  ValidateNested,
} from 'class-validator';

export class TableConfig {
  @IsString()
  public readonly name!: string;
}

export class DatabaseConfig {
  @IsString()
  public readonly host!: string;

  @IsInt()
  public readonly port!: number;

  @Type(() => TableConfig)
  @ValidateNested()
  @IsDefined()
  public readonly table!: TableConfig;
}

export class Config {
  @Type(() => DatabaseConfig)
  @ValidateNested()
  @IsDefined()
  public readonly database!: DatabaseConfig;

  @IsBoolean()
  public readonly isAuthEnabled!: boolean;
}
