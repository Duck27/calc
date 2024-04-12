import { useEffect, useState } from "react";
import styles from "./CalculatorModule.module.css";
import { v4 as uuid } from "uuid";
import { Calculator } from "./Calculator";
import { getCountNumbAftDecimal } from "../utils/getCountNumbAfterDec";
import { IHistoryPart } from "../@types/types";

const CalculatorModule = () => {
  const [view, setView] = useState("");
  const [history, setHistory] = useState<string[]>(["0"]);

  const [historyParts, setHistoryParts] = useState<IHistoryPart[]>([]);

  const [number, setNumber] = useState("0");
  const [action, setAction] = useState("");
  const [brackets, setBrackets] = useState("");

  const [numArray, setNumArray] = useState<string[]>([]);

  const [actionArray, setActionArray] = useState<string[]>([]);
  const [bracketsArray, setBracketsArray] = useState<string[]>([]);

  const separator = "NewHistoryCycle"; // переменная, используемая для разделения циклов истории после каждого вычисления

  function clickNumber(digit: string) {
    if (action) {
      setActionArray((prev) => [...prev, action]);
      setAction("");
    } else if (brackets) {
      setBrackets("");
    } else if (number.length === 1 && numArray.length === 0 && number === "0") {
      // работа с попыткой кликнуть на число при одном нуле в калькуляторе
      setNumber(digit);
      setHistory((prev) => {
        const newHistory = prev.slice(0, -1);
        return [...newHistory, digit];
      });
      return;
    }

    if (number.length === 1 && number.startsWith("0")) return;
    // работа с попыткой кликнуть на число при нуле в первом числе

    setNumber((prev) => prev + digit);

    if (number.includes(".")) {
      // работа с плавающей точкой
      setHistory((prev) => {
        let oldNum = prev.at(-1);
        const newHistory = prev.slice(0, -1);
        const newNum = oldNum + digit;
        return [...newHistory, newNum];
      });
    } else {
      setHistory((prev) => [...prev, digit]);
    }
  }

  function clickAction(action: string) {
    if (number) {
      if (number.endsWith(".")) {
        // нельзя позволить ставить знак когда число кончается точкой
        return;
      } else {
        setNumArray((prev) => [...prev, number]);
        setNumber("");
        setHistory((prev) => [...prev, " ", action, " "]);
      }
    } else if (brackets) {
      setHistory((prev) => [...prev, " ", action, " "]);
      setBrackets("");
    } else {
      setHistory((prev) => {
        const newHistory = prev.slice(0, -3);
        return [...newHistory, " ", action, " "];
      });
    }

    setAction(action);
  }

  function clickBrackets(brackets: string) {
    if (number) {
      if (number.endsWith(".")) {
        // аналогично для скобок
        return;
      } else {
        setNumArray((prev) => [...prev, number]);
        setNumber("");
      }
    }
    if (action) {
      setActionArray((prev) => [...prev, action]);
      setAction("");
    }
    if (brackets) {
      setBracketsArray((prev) => [...prev, brackets]);
      setBrackets("");
    }
    setBrackets(brackets);
    setHistory((prev) => [...prev, " ", brackets, " "]);
  }

  function undoLastStep() {
    setHistory((prev) => {
      if (prev.length > 1) {
        let deleteLength;
        if (
          prev[prev.length - 1] === " " ||
          prev[prev.length - 2] === separator
        ) {
          deleteLength = prev.length > 1 ? -2 : -1;
        } else {
          deleteLength = -1;
        }
        // рассчет длины удаления ввиду присутствия в history пробелов для отображения view - если видится пробел или раздетилель, то их удаляют включительно, иначе переход лишь на один знак
        const newHistory = prev.slice(0, deleteLength);
        return [...newHistory];
      } else {
        setNumArray([]);
        setNumber("0");
        return ["0"];
      }
    });
  }

  useEffect(() => {
    setView(history.join("").split(separator).at(-1) as string); // обновление View при каждом изменении истории
  }, [history]);

  function calculate() {
    let newView = Calculator.calculate(view);

    if (view === newView.toString()) return;

    if (!isNaN(newView) && typeof newView !== "undefined") {
      const lastHistoryPart = {
        id: uuid(),
        text: history.join("").split(separator).at(-1) as string,
      };
      setHistoryParts([...historyParts, lastHistoryPart]);
      setNumArray([]);
      setActionArray([]);
      let newView = String(Calculator.calculate(view));
      newView = String(
        Math.round(parseFloat(newView) * 1000000000) / 1000000000
        // решение проблем с обработкой плавающих чисел в js
      );

      setAction("");
      setNumber(newView);
      setHistory((prev) => [...prev, separator, newView]);
    } else {
      setView("Error");
    }
  }

  function setDot() {
    if (number.includes(".")) {
      const numbersAfterDot = getCountNumbAftDecimal(Number(number));
      const newNumber = (Number(number) / 10).toFixed(
        numbersAfterDot === 0 ? 1 : numbersAfterDot
      );
      // механизм для правильного деления чисел на 10 при попытке нажать точку в числе, у которого она уже стоит
      // getCountNumbAftDecimal вернет количество чисел после точки

      const lastNumLen = getLastHistNumbLen();

      setNumber(newNumber);
      setHistory((prev) => {
        const newHistory = prev.slice(0, -lastNumLen);
        return [...newHistory, newNumber];
      });
    } else {
      setNumber((prev) => prev + ".");
      setHistory((prev) => {
        return [...prev, "."];
      });
    }
  }

  function getLastHistNumbLen() {
    let numLength = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i] === separator || history[i] === " ") break;
      numLength++;
    }
    return numLength;
  }

  function setNewHistoryPart(expression: string) {
    setHistory((prev) => [...prev, separator, expression]);
  }

  function deleteHistoryPart(id: string) {
    setHistoryParts((prev) => prev.filter((part) => part.id != id));
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.calc__form}>
        <div className={styles.viewField}>
          <span>{view}</span>
        </div>
        <div className={styles.calc__btns_grid}>
          <button
            onClick={() => {
              undoLastStep();
            }}
            className={styles.calc__btn}
          >
            {number === "0" && numArray.length === 0 ? "CE" : "AC"}
          </button>
          <button
            onClick={() => {
              clickBrackets("(");
            }}
            className={styles.calc__btn}
          >
            &#40;
          </button>
          <button
            onClick={() => {
              clickBrackets(")");
            }}
            className={styles.calc__btn}
          >
            &#41;
          </button>
          <button
            onClick={() => {
              clickAction(" % ");
            }}
            className={styles.calc__btn}
          >
            %
          </button>

          <button
            onClick={() => {
              clickNumber("7");
            }}
            className={styles.calc__btn}
          >
            7
          </button>
          <button
            onClick={() => {
              clickNumber("8");
            }}
            className={styles.calc__btn}
          >
            8
          </button>
          <button
            onClick={() => {
              clickNumber("9");
            }}
            className={styles.calc__btn}
          >
            9
          </button>
          <button
            onClick={() => {
              clickAction("÷");
            }}
            className={styles.calc__btn}
          >
            ÷
          </button>

          <button
            onClick={() => {
              clickNumber("4");
            }}
            className={styles.calc__btn}
          >
            4
          </button>
          <button
            onClick={() => {
              clickNumber("5");
            }}
            className={styles.calc__btn}
          >
            5
          </button>
          <button
            onClick={() => {
              clickNumber("6");
            }}
            className={styles.calc__btn}
          >
            6
          </button>
          <button
            onClick={() => {
              clickAction("∗");
            }}
            className={styles.calc__btn}
          >
            ∗
          </button>

          <button
            onClick={() => {
              clickNumber("1");
            }}
            className={styles.calc__btn}
          >
            1
          </button>
          <button
            onClick={() => {
              clickNumber("2");
            }}
            className={styles.calc__btn}
          >
            2
          </button>
          <button
            onClick={() => {
              clickNumber("3");
            }}
            className={styles.calc__btn}
          >
            3
          </button>
          <button
            onClick={() => {
              clickAction("-");
            }}
            className={styles.calc__btn}
          >
            -
          </button>

          <button
            onClick={() => {
              clickNumber("0");
            }}
            className={styles.calc__btn}
          >
            0
          </button>

          <button
            onClick={() => {
              setDot();
            }}
            className={styles.calc__btn}
          >
            .
          </button>
          <button
            onClick={() => {
              calculate();
            }}
            className={styles.calc__btn}
          >
            =
          </button>
          <button
            onClick={() => {
              clickAction("+");
            }}
            className={styles.calc__btn}
          >
            +
          </button>
        </div>
      </div>
      <div className={styles.historyBlock}>
        <div>Последние вычисления: </div>
        {historyParts.map((historyBlock) => (
          <button
            key={historyBlock.id}
            onClick={() => setNewHistoryPart(historyBlock.text)}
            className={styles.history__part}
          >
            <span className={styles.history__partText}>
              {historyBlock.text}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteHistoryPart(historyBlock.id);
              }}
              className={styles.history__partDeleteBtn}
            >
              X
            </button>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalculatorModule;
