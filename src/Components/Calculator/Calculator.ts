export class Calculator {
  private static operators: { [key: string]: number } = {
    "+": 1,
    "-": 1,
    "∗": 2,
    "÷": 2,
  };

  private static isValidExpression(expression: string): boolean {
    let stack = [];

    for (let char of expression) {
      if (char === "(") {
        stack.push(char);
      } else if (char === ")") {
        if (stack.length === 0) {
          return false;
        }
        stack.pop();
      }
    }

    return stack.length === 0;
  }

  private static toRPN(expression: string): string[] {
    let outputQueue = "";
    let operatorStack: string[] = [];
    let tokens = expression.split(/\s+/);

    tokens.forEach((token) => {
      if (!isNaN(token)) {
        outputQueue += token + " ";
      } else if (token in this.operators) {
        while (
          operatorStack.length > 0 &&
          this.operators[token] <=
            this.operators[operatorStack[operatorStack.length - 1]]
        ) {
          outputQueue += operatorStack.pop() + " ";
        }
        operatorStack.push(token);
      } else if (token === "(") {
        operatorStack.push(token);
      } else if (token === ")") {
        while (operatorStack[operatorStack.length - 1] !== "(") {
          outputQueue += operatorStack.pop() + " ";
        }
        operatorStack.pop();
      }
    });

    while (operatorStack.length > 0) {
      outputQueue += operatorStack.pop() + " ";
    }

    return outputQueue.split(" ").filter((token) => token !== "");
  }

  public static calculate(expression: string): number {
    if (!this.isValidExpression(expression)) {
      return NaN;
    }

    let rpn = this.toRPN(expression);
    let stack: number[] = [];

    rpn.forEach((token) => {
      if (!isNaN(token)) {
        stack.push(parseFloat(token));
      } else if (stack.length >= 2) {
        let [b, a]: [number, number] = [stack.pop(), stack.pop()];

        switch (token) {
          case "+":
            stack.push(a + b);
            break;
          case "-":
            stack.push(a - b);
            break;
          case "∗":
            stack.push(a * b);
            break;
          case "÷":
            stack.push(a / b);
            break;
        }
      } else throw new Error("Ошибка: стек пуст");
    });

    if (stack.length > 0) {
      return stack.pop() as number;
    } else {
      throw new Error("Ошибка: стек пуст");
    }
  }
}
