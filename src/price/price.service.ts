import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PriceService {
  constructor(private httpService: HttpService) {}

  async getMarkedPrice(): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get('http://localhost:3000/price/getMarkedPrice'),
    );
    return response.data;
  }

  async getOraclePrice(): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get('http://localhost:3000/price/getOraclePrice'),
    );
    return response.data;
  }
}
