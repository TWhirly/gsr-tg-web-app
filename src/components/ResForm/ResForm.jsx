import React, { useCallback, useEffect, useState, useRef } from 'react';
import './ResForm.css';
import { localUrl } from '../../localSettings.js'
import 'animate.css';

import { NumberField, Label, Group, Input, Button, Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';
import { useLinkProps } from '@react-aria/utils';
import { useTelegram } from "../../hooks/useTelegram";
import { type } from '@testing-library/user-event/dist/type/index.js';


// import { Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';

const APIURL = localUrl.APIURL;



const ResForm = () => {

    

    const fetchFormFields = async () => {
        const response = await fetch(APIURL + '/res'); // Генерируем объект Response
        const jVal = await response.json(); // Парсим тело ответа
        return jVal
    };

    const [fields, setFields] = useState([]);
    const [formData, setFormData] = useState({});
    const [allFieldsFilled, setIsFormComplete] = useState(false);

    useEffect(() => {
        const loadFields = async () => {
            const fetchedFields = await fetchFormFields();
            setFields(fetchedFields);
            // Инициализируем состояние formData с пустыми значениями
            const initialFormData = fetchedFields.reduce((acc, field) => {
                acc[field.id] = NaN;

                return acc;
            }, {});
            setFormData(initialFormData);
        };

        loadFields();
    }, []);


    const handleChange = (value, id) => {


        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));

        console.log('change ', formData)

    };

    const handleInput = (e) => {
       const id = e.target['id'];
       const value = e.target['value']
    //    if(value == '' || isNaN(value)){
    //     setIsFormComplete(NaN)
    //    }
       console.log(e.target['value'])
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));

        console.log('input ', formData)
       
    };

    useEffect(() => {
        // Проверяем, заполнены ли все поля формы
        const allFieldsFilled = fields.every(field => (!isNaN(formData[field.id]) && formData[field.id]));
        setIsFormComplete(allFieldsFilled);
    }, [formData, fields]);

    const handleSubmit = () => {
        console.log(allFieldsFilled);
        console.log(formData)
        console.log("tyring to submit resToSubmit values:", formData);
        fetch(APIURL + '/web-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...formData, initData: window.Telegram.WebApp.initData })
        })

    }

    return (
        <>
            <h3 style={{ textAlign: 'center' }}>Введите текущие расчетные остатки</h3>
            {fields.map((field) => {

                return (

                    <NumberField id={field.id} value={formData[field.id]}
                        minValue={0}
                        defaultValue={''} 
                        isRequired={true}
                        maxValue={99999} 
                        onInput={handleInput}
                        onChange={(v) => handleChange(v, field.id)}

                    >

                        <Label > {field.id}</Label>

                        <Group >
                            <Button slot="decrement">&minus;</Button>
                            <Input />
                            <Button slot="increment">+</Button>
                        </Group>
                    </NumberField>

                )
            })}

            {/* {!isFormComplete && (<Button  className={'Submit'} ></Button>)} */}
            {(allFieldsFilled && <Button onPress={handleSubmit} className={'Submit'} >Отправить</Button>)}
            {/* {(<Button onPress={handleSubmit} isDisabled={!isFormComplete} className={'Submit'} >Отправить</Button>)} */}

        </>
    )

};

export default ResForm;