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
