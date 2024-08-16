import React, { useState } from 'react';
import './ButtonList.css';
import { useTelegram } from "../../hooks/useTelegram";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {localUrl} from '../../localSettings.js'

const APIURL = localUrl.APIURL;

console.log(APIURL)

const ButtonList = () => {

    const [data, setData] = useState([]);
    useEffect(() => {
        buttons();
    }, []);


    const buttons = async () => {
        const response = await fetch(APIURL + '/menu');
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
       
        navigate("/ResForm");

    }


    return (
        <div className={'list'} >

            {data.map(item => (<button className={'btn'} onClick={handleClick} >  {item.action} </button>))}


        </div>
    );



}

export default ButtonList;