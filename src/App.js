import '../src/css/theme.css';
import { useEffect } from "react";
import { useTelegram } from "./hooks/useTelegram";
import Header from "./components/Header/Header";
import { Route, Routes } from 'react-router-dom'
import ButtonList from "./components/ButtonList/ButtonList";
import ResForm from "./components/ResForm/ResForm";
import FormComponent from './components/ResForm/form_try';

function App() {
    // eslint-disable-next-line no-unused-vars
    const { onToggleButton, tg } = useTelegram();

    useEffect(() => {
        tg.ready();
    }, [])

    return (
        <div className="App">
            <Header />
            <Routes>
                <Route path="/" element={<ButtonList />} />
                <Route path="/ResForm" element={<ResForm />} />
            </Routes>
        </div>
    );
}

export default App