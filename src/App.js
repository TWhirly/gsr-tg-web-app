import './App.css';
import {useEffect} from "react";
import {useTelegram} from "./hooks/useTelegram";
import Header from "./components/Header/Header";
import {Route, Routes} from 'react-router-dom'
// import ProductList from "./components/ProductList/ProductList";
import Form from "./components/Form/Form";
import { Table } from 'react-aria-components';
import Table from "./components/Table/table";

function App() {
    // eslint-disable-next-line no-unused-vars
    const {onToggleButton, tg} = useTelegram();

    useEffect(() => {
        tg.ready();
    }, [tg])

    return (
        <div className="App">
            <Header />
            <Routes>
                <Route index element={<Table />}/>
                {/* <Route path={'form'} element={<Form />}/> */}
            </Routes>
        </div>
    );
}

export default App;