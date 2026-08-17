export const randomDecimal = (min, max, decimals = 2) => {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
};

export const randomDepositAmountWithDecimals = () => {
  return randomDecimal(0.01, 5000, 2);
};
export const randomTransferAmountWithDecimalsBelow = (num) => {
  return randomDecimal(0.01, num, 2);
};

const generateRandomAlphabetic = (length) => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * letters.length);
    result += letters[randomIndex];
  }
  return result;
};

export const randomAlphabeticString = () => {
  return generateRandomAlphabetic(4) + ' ' + generateRandomAlphabetic(4);
};

export const randomInvalidProfileName = () => {
  return generateRandomAlphabetic(4);
};
