import { IsEnum, IsUrl, MaxLength, MinLength } from 'class-validator';

export enum ParamterInfo {
  HUMIDITY = 'humidity',
  PRESSURE = 'pressure',
  TEMPERATURE = 'temperature',
  GAS_RESISTANCE = 'gasResistance',
}

export enum OperatorInfo {
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUAL_TO = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUAL_TO = 'lte',
}

export class OnCreateTriggerInfo {
  @MinLength(1)
  @MaxLength(99)
  public name: string | undefined;

  @IsUrl({ protocols: ['http', 'https'], require_protocol: true, require_valid_protocol: true, require_host: true })
  public postUrl: string | undefined;

  public threshold: number | undefined;

  @IsEnum(ParamterInfo)
  public parameter: 'humidity' | 'pressure' | 'temperature' | 'gasResistance' | undefined;

  @IsEnum(OperatorInfo)
  public operator: 'gt' | 'gte' | 'lt' | 'lte' | undefined;
}
