import React, { useCallback, useEffect, useState } from 'react';
import './ResForm.css';
import { useTelegram } from "../../hooks/useTelegram";
import { NumberField, Label, Group, Input, Button, Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';
import { useLinkProps } from '@react-aria/utils';

// import { Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';



const ResForm = () => {

    const [resData, setResData] = useState('');

    const [data, setData] = useState([]);
    useEffect(() => {
        buttons();
    }, []);

    const buttons = async () => {
        const response = await fetch('http://192.168.1.103:8000/res'); // Генерируем объект Response
        const jVal = await response.json(); // Парсим тело ответа
        setData(jVal);
    }

    

    const { tg, queryId } = useTelegram();
    // tg.MainButton.hide()
    // const handleClick = (item) => {
    //     tg.MainButton.show()
    //     tg.MainButton.setParams({
    //         text: `Перейти к ` + item

    //     })
    //     // alert('clicked ' + item);
        

    // }

    const handleChange = (e) => {
        console.log('changed');
        console.log(e);
        
       
        // resData[e.target.getAttribute('a-key')] = e.target.value;
        // setResData(resData);
    }

    const [sent, setSent] = useState('not sent');
    const handleClick = () => {
        
        setSent('sent');

    }
    
    let values =[];

    return (
        <div >
                Введите остатки
            {data.map(item => ( <NumberField defaultValue={0} minValue={0} a-key={item} onChange={handleChange} label='no spam'>
            <Label>{item["tank&fuel type"]}</Label>
            
                <Group>
                
                    <Input />
                    
                    <Button slot="decrement" className={'decrement'}>-</Button>
                    <Button slot="increment" className={'increment'}>+</Button>
                </Group>
            </NumberField>)) }
            <button onClick={() => handleClick()}>Send </button>
                {sent}<br/>
                {/* {resData.toString()} */}

        </div>
    );

   

};

export default ResForm;