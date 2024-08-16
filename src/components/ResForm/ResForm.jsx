import React, { useCallback, useEffect, useState } from 'react';
import './ResForm.css';
import {localUrl} from '../../localSettings.js'

import { NumberField, Label, Group, Input, Button, Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';
import { useLinkProps } from '@react-aria/utils';
import { useTelegram } from "../../hooks/useTelegram";


// import { Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';

const APIURL = localUrl.APIURL;
const ResForm = () => {



    const [resFromDB, setData] = useState([]);
    useEffect(() => {
        buttons();
    }, []);



    const buttons = async () => {
        const response = await fetch(APIURL + '/res'); // Генерируем объект Response
        const jVal = await response.json(); // Парсим тело ответа
        setData(jVal);

    }

    // console.log(resFromDB);
    let inputRes = {};
    let inputResArray = [];

    // let [resToSubmit, SetResToSubmit] = React.useState(resFromDB.reduce((acc, item, currInd, resFromDB) => {
    let resToSubmit = resFromDB.reduce((acc, item) => {
        // acc[Object.keys(item)[0]] = Object.values(item)[0];
        // console.log('resFromDB ' + resFromDB + ' ' + typeof(resFromDB));
        // acc[Object.values(item)[0]] = [Object.keys(item)[0]];
        acc[Object.values(item)[0]] = 0
        // inputResArray.push();
        // console.log('Object.values ' + [Object.values(item)[0]] + 'Object keys ' + [Object.keys(item)[0]])
        return acc;
    }, {});
    console.log("resToSubmit var after UseState:", resToSubmit);

    const handlerChange = (v, name) => {
        console.log("called handlerChange with arguments:", v, name);
        // SetResToSubmit({ ...resToSubmit, [name]: v });
        Object.defineProperty(resToSubmit, name, {
            value: v,
        });
    }

    const handleSubmit = () => {
        console.log(resToSubmit)
        console.log("tyring to submit resToSubmit values:", resToSubmit);
        fetch(APIURL + '/web-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({...resToSubmit, initData: window.Telegram.WebApp.initData})
        })

    }

    return (
        <>
             <h3 style={{textAlign: 'center'}}>Введите текущие расчетные остатки</h3>
            {resFromDB.map(item => {
                const resTank = Object.values(item)[0];
                // const resValue = Object.values(item)[0];
                return (
                    
                    <NumberField  minValue={0} key={resTank} onChange={(v) => handlerChange(v, resTank)}>
                        
                         <Label > {resTank}</Label>
                        
                         <Group >
                        <Button slot="decrement">&minus;</Button>
                        <Input  / >   
                            <Button slot="increment">+</Button>
                            </Group>
                    </NumberField>
                   
                )
            })}
            <Button onPress={handleSubmit} className={'Submit'}>Отправить</Button>
        </>
    )



};

export default ResForm;