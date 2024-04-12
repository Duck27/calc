export function getCountNumbAftDecimal(number: number) {
  let strNum = number.toString();
  if (strNum.includes(".")) {
    let decimalPart = strNum.split(".")[1];
    let count = decimalPart.length + 1;
    return count;
  } else {
    return 0;
  }
}
