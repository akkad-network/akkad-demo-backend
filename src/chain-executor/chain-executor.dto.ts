export class CalculateMulticallResponseDto {
  pools: string[];
  indexPerOperations: IndexPerOperationDto[];
}

export class IndexPerOperationDto {
  index: number;
  indexNext: number;
  indexEnd: number;
}
