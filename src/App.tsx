import styles from "./App.module.css";
import "./reset.css";
import Calculator from "./Components/Calculator/CalculatorModule";
import Sidebar from "./Components/Sidebar/Sidebar";

function App() {
  return (
    <div className={styles.background}>
      <Sidebar />
      <Calculator />
    </div>
  );
}

export default App;
