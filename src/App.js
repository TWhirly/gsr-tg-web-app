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
import HotDog from './components/HotDog/HotDog';
import ShopOrders from './components/ShopOrders/shopOredrs.jsx'
import CoffeIngs from './components/CoffeIngs/CoffeIngs.jsx';
import FuelIntake from './components/fuelIntake/FuelIntake.jsx';
import FormComponent from './components/ResForm/form_try';
import RepArchive from './components/RepArchive/RepArchive.jsx';
import ShiftRep from './components/ShiftRep/ShiftRep.jsx';
import Measures from './components/Measures/Measures.jsx'
import { DataProvider } from './DataContext';

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
        <DataProvider>
        <div className={App}>
            <Header />
            <Routes>
                <Route path="/" element={<ButtonList />} />
                <Route path="/ResForm" element={<ResForm />} />
                <Route path="/CoffeCounts" element={<CoffeCounts />} />
                <Route path="/GasForm" element={<GasForm />} />
                <Route path="/CafeRems" element={<CafeRems />} />
                <Route path="/HotDog" element={<HotDog />} />
                <Route path="/ShopOrders" element={<ShopOrders />} />
                <Route path="/CoffeIngs" element={<CoffeIngs />} />
                <Route path="/FuelIntake" element={<FuelIntake />} />
                <Route path="/ShiftRep" element={<ShiftRep />} />
                <Route path="/Measures" element={<Measures />} />
                <Route path="/RepArchive" element={<RepArchive />} />
            </Routes>
        </div>
        </DataProvider>
    );
}

export default App