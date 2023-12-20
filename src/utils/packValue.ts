import { BigNumber, ethers } from 'ethers';

export function packPoolIndexes(poolIndexes: number[]) {
  let packedValue = BigNumber.from(0);
  const bitsPerPoolIndex = 24;

  // 打包每个资金池索引
  poolIndexes.forEach((index, i) => {
    if (index < 0 || index >= Math.pow(2, bitsPerPoolIndex)) {
      throw new Error(`Pool index out of range at position ${i}`);
    }
    const shiftedIndex = BigNumber.from(index).shl(i * bitsPerPoolIndex);
    packedValue = packedValue.or(shiftedIndex);
  });

  // 添加资金池数量到最后的 8 位
  const poolCount = poolIndexes.length;
  const poolCountValue = BigNumber.from(poolCount).shl(240);
  packedValue = packedValue.or(poolCountValue);

  return packedValue;
}

export function packTokenPrice(
  tokenIndex: number,
  priceX96: string,
  pricePosition: number,
): BigNumber {
  const packedTokenIndex = BigNumber.from(tokenIndex);
  const packedPriceX96 = ethers.utils.parseEther(priceX96).shl(pricePosition);

  return packedPriceX96.or(packedTokenIndex);
}

export function packPrice(tokenIndex: number, price: string) {
  if (tokenIndex < 0 || tokenIndex >= Math.pow(2, tokenIndex)) {
    throw new Error(`Pool index out of range at position ${tokenIndex}`);
  }

  const packedValue = packTokenPrice(tokenIndex, price, 24);

  console.log('packedValue ', packedValue);

  return packedValue;
}

export type PriceItem = [tokenIndex: number, price: string];

export function packPrices(prices: PriceItem[]) {
  return prices.map((tokenIdx) => packPrice(...tokenIdx));
}

export function unpackUint8FromPackedValue(
  packedValue: BigNumber,
  position: number,
) {
  const mask = BigNumber.from(0xff); // 8 位掩码
  const unpackedValue = packedValue.shr(position).and(mask);
  return unpackedValue.toNumber();
}
