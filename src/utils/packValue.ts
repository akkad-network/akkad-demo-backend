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

export function packPrice(tokenIndex: number, price: string) {
  console.log('tokenIndex ', tokenIndex);
  console.log('price ', price);

  let packedValue = BigNumber.from(0);

  if (tokenIndex < 0 || tokenIndex >= Math.pow(2, tokenIndex)) {
    throw new Error(`Pool index out of range at position ${tokenIndex}`);
  }

  const tokenIndexBN = BigNumber.from(tokenIndex);

  packedValue = packedValue.or(tokenIndexBN);
  console.log('packedValue ', packedValue);
  const poolCountValueRaw = ethers.utils.parseEther(price);
  console.log('poolCountValueRaw ', poolCountValueRaw);
  const poolCountValue = poolCountValueRaw.shl(183);
  console.log('poolCountValue ', poolCountValue);
  packedValue = packedValue.or(poolCountValue);

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
