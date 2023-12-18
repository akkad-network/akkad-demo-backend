export async function requestData(
  func: () => Promise<any>,
  checkResult?: (value: any) => boolean,
  maxTimes = 3,
  intervalTime = 300,
) {
  let index = 0;
  let result: any;
  let success = false;
  let error: any;
  while (index < maxTimes) {
    try {
      result = await func();
      if (typeof checkResult === 'function' && !checkResult(result)) {
        throw new Error('Invalid Result');
      }
      success = true;
      break;
    } catch (ex) {
      await new Promise((r) => setTimeout(r, intervalTime));
      error = ex;
      index += 1;
    }
  }
  return { success, result, error };
}

export async function wrapResponse(func: () => Promise<any>, extra?: any) {
  try {
    const result = await func();
    return {
      success: true,
      data: result,
      extra,
    };
  } catch (ex) {
    return {
      success: false,
      message: ex?.message,
      extra,
    };
  }
}
