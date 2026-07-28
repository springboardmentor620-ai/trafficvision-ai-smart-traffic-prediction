import { useState } from "react";
import { ThemeContext } from "./theme";

export function ThemeProvider({ children }) {

    const [darkMode, setDarkMode] = useState(true);

    const toggleTheme = () => {

        setDarkMode(!darkMode);

    };

    return (

        <ThemeContext.Provider
            value={{
                darkMode,
                toggleTheme,
            }}
        >

            {children}

        </ThemeContext.Provider>

    );

}

