import React, { useState } from 'react';
import './ButtonList.css';
import ButtonItem from "../ButtonItem/ButtonItem";
import { useTelegram } from "../../hooks/useTelegram";
import { useCallback, useEffect } from "react";
import { Button } from "../button/button"
import { Link } from 'react-router-dom';
import Form from "../Form/Form";
import ResForm from "../ResForm/ResForm";
import { useNavigate } from "react-router-dom";

// const buttons = [
//     { id: '1', description: 'Синего цвета, прямые', title: Date.now(), price: 5000 },
//     { id: '2', title: 'Куртка', price: 12000, description: 'Зеленого цвета, теплая' },
//     { id: '3', title: 'Джинсы 2', price: 5000, description: 'Синего цвета, прямые' },
//     { id: '4', title: 'Куртка 8', price: 122, description: 'Зеленого цвета, теплая' },
//     { id: '5', title: 'Джинсы 3', price: 5000, description: 'Синего цвета, прямые' },
//     { id: '6', title: 'Куртка 7', price: 600, description: 'Зеленого цвета, теплая' },
//     { id: '7', title: 'Джинсы 4', price: 5500, description: 'Синего цвета, прямые' },
//     { id: '8', title: 'Куртка 5', price: 12000, description: 'Зеленого цвета, теплая' },
// ]

// const buttons = Promise.resolve(await (await fetch('http://localhost:8000/trucks-data')).json())




//console.log(buttons)

const ButtonList = () => {

    const [data, setData] = useState([]);
    useEffect(() => {
        buttons();
    }, []);


    const buttons = async () => {
        const response = await fetch('http://192.168.1.103:8000/menu');
        // console.log(...response);
        // Генерируем объект Response
        const jVal = await response.json();
        // console.log(jVal);
         // Парсим тело ответа
        setData(jVal);
    }

    
    

    const navigate = useNavigate();

    const { tg, queryId } = useTelegram();

    const handleClick = (item) => {
        tg.MainButton.show()
        tg.MainButton.setParams({
            text: `Перейти к ` + item

        })
        // alert('clicked ' + item);
        navigate("/ResForm");

    }


    return (
        <div className={'list'} >

            {data.map(item => (<button className={'btn'} onClick={handleClick} >  {item.action} </button>))}


        </div>
    );



}

export default ButtonList;