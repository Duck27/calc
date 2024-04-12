import { useState } from "react";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  return (
    <div className={open ? styles.main__wrapper : styles.main__closeWrapper}>
      <div className={open ? styles.wrapper : styles.closeWrapper}>
        <div className={styles.sidebar}>
          {open && (
            <>
              <h2>Калькулятор </h2>
              <span className={styles.selector}>Выбери нужное приложение</span>
              <div>тут список модулей</div>
            </>
          )}
        </div>
        <button
          className={open ? styles.toggleBtn : styles.closeToggleBtn}
          onClick={() => {
            setOpen((prev) => !prev);
          }}
        >
          {open ? "<" : ">"}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
