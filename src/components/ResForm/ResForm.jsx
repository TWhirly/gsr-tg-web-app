import React, { useCallback, useEffect, useState } from 'react';
import './ResForm.css';
import { useTelegram } from "../../hooks/useTelegram";
import { NumberField, Label, Group, Input, Button, Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';
import { useLinkProps } from '@react-aria/utils';


// import { Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';



const ResForm = () => {



    const [resFromDB, setData] = useState([]);
    useEffect(() => {
        buttons();
    }, []);



    const buttons = async () => {
        const response = await fetch('http://192.168.1.103:8000/res'); // Генерируем объект Response
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
    }

    return (
        <>

            {resFromDB.map(item => {
                const resTank = Object.values(item)[0];
                // const resValue = Object.values(item)[0];
                return (
                    <NumberField  className={'react-aria-NumberField'} minValue={0} key={resTank} onChange={(v) => handlerChange(v, resTank)}>
                        <Label className={'Label'}> {resTank}</Label>
                        <Group>
                        
                        <Button slot="decrement">-</Button>
                        <Input  / >   
                        
                            
                            
                            <Button slot="increment">+</Button>
                        </Group>
                    </NumberField>
                )
            })}
            <Button onPress={handleSubmit} className={'Submit'}>Submit</Button>
        </>
    )



};

export default ResForm;