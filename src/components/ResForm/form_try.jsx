import React, { useEffect, useState } from 'react';
import { localUrl } from '../../localSettings.js'
import { NumberField, Label, Group, Input, Button, Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';


const APIURL = localUrl.APIURL;

const FormComponent = () => {

    const fetchFormFields = async () => {
        const response = await fetch(APIURL + '/res'); // Генерируем объект Response
        const jVal = await response.json(); // Парсим тело ответа
        return jVal
    };

    const [fields, setFields] = useState([]);
    const [formData, setFormData] = useState({});
    const [isFormComplete, setIsFormComplete] = useState(false);

    useEffect(() => {
        const loadFields = async () => {
            const fetchedFields = await fetchFormFields();
            setFields(fetchedFields);
            // Инициализируем состояние formData с пустыми значениями
            const initialFormData = fetchedFields.reduce((acc, field) => {
                acc[field.id] = '';
                
                return acc;
            }, {});
            setFormData(initialFormData);
        };

        loadFields();
    }, []);

    
    const handleChange = (value, id) => {
        // const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    useEffect(() => {
        // Проверяем, заполнены ли все поля формы
        const allFieldsFilled = fields.every(field => formData[field.id]);
        setIsFormComplete(allFieldsFilled);
    }, [formData, fields]);

    const handleSubmit = () => {
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

                    <NumberField  id={field.id} value={formData[field.id]} onChange={(v) => handleChange(v, field.id)}>

                        <Label > {field.id}</Label>

                        <Group >
                            <Button slot="decrement">&minus;</Button>
                            <Input />
                            <Button slot="increment">+</Button>
                        </Group>
                    </NumberField>

                )
            })}
        
            {isFormComplete && (<Button onPress={handleSubmit}  className={'Submit'} >Отправить</Button>)}
        </>
    )

};

export default FormComponent;
