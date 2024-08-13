import './App.css';
import { useEffect } from "react";
import { useTelegram } from "./hooks/useTelegram";
import Header from "./components/Header/Header";
import { Route, Routes } from 'react-router-dom'
import ProductList from "./components/ProductList/ProductList";
import ButtonList from "./components/ButtonList/ButtonList";
// import {Cell, Column, Row, Table, TableBody, TableHeader} from 'react-aria-components';
// import ProductList from "./components/ProductList/ProductList";
import Form from "./components/Form/Form";
import ResForm from "./components/ResForm/ResForm";
import Button from './components/button/button';


// import { Table } from 'react-aria-components';
import MyTable from "./components/Table/table";
// import { Button } from 'react-aria-components';

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
                <Route path="/Form" element={<Form />} />
                <Route path="/ResForm" element={<ResForm />} />

            </Routes>
        </div>
    );
}

export default App;