// import '../src/css/theme.css';
import styles from './App.module.css'
import { useEffect } from "react";
import { useTelegram } from "./hooks/useTelegram";
import Header from "./components/Header/Header";
import { Route, Routes } from 'react-router-dom'
import ButtonList from "./components/ButtonList/ButtonList";
import ResForm from "./components/ResForm/ResForm";
import GasForm from './components/gas/GasForm';
import CoffeCounts from './components/coffeCounts/CoffeCounts';
import CafeRems from './components/CafeRems/CafeRems';
import FormComponent from './components/ResForm/form_try';

function App() {
    // eslint-disable-next-line no-unused-vars
    const { onToggleButton, tg } = useTelegram();
    window.Telegram.WebApp.expand();
    window.Telegram.WebApp.disableVerticalSwipes()
    var appStyleClassName = ''
    const bgColorInput = document.getElementById("bg-color");

    if (window.Telegram.WebApp.colorScheme == 'dark') {
        appStyleClassName = 'AppDark';
        document.documentElement.style.setProperty("--bgColor", "#000000");
        tg.setHeaderColor("#000000");
    }
    else {
        appStyleClassName = 'AppLight';
        document.documentElement.style.setProperty("--bgColor", "#ffffff");
        tg.setHeaderColor("#ffffff")
    }
    console.log('scheme', window.Telegram.WebApp.colorScheme)

    useEffect(() => {
        tg.ready();
    }, [])

    const divContainer = document.getElementById("App");
    

    return (
        <div className={App}>
            <Header />
            <Routes>
                <Route path="/" element={<ButtonList />} />
                <Route path="/ResForm" element={<ResForm />} />
                <Route path="/CoffeCounts" element={<CoffeCounts />} />
                <Route path="/GasForm" element={<GasForm />} />
                <Route path="/CafeRems" element={<CafeRems />} />
            </Routes>
        </div>
    );
}

export default App