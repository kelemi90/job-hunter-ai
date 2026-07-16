import { IsArray, IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdatePreferencesDto {
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsArray()
  @IsString({ each: true })
  locations: string[];

  @IsString()
  @IsOptional()
  cvText?: string;

  @IsInt()
  @IsOptional()
  minSalary?: number;

  @IsInt()
  @IsOptional()
  maxSalary?: number;

  @IsBoolean()
  @IsOptional()
  remoteOnly?: boolean;

  @IsString()
  @IsOptional()
  seniorityLevel?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];
}
