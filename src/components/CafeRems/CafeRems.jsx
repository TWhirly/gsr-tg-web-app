import React, { useCallback, useEffect, useState, useRef } from 'react';
import styles from './CafeRems.module.css';
import { localUrl } from '../../localSettings.js'
import 'animate.css';
import { useNavigate, useHistory } from "react-router-dom";
import { NumberField, Label, Group, Input, Button, Cell, Column, Row, Table, TableBody, TableHeader, Text } from 'react-aria-components';
import { useLinkProps } from '@react-aria/utils';
import { useTelegram } from "../../hooks/useTelegram.js";
import { type } from '@testing-library/user-event/dist/type/index.js';


const APIURL = localUrl.APIURL;

const CafeRems = () => {
    const navigate = useNavigate();

    const fetchFormFields = async () => {
        const response = await fetch(APIURL + '/cafeRems/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ initData: window.Telegram.WebApp.initData })
        }); // Генерируем объект Response
        const jVal = await response.json(); // Парсим тело ответа
        console.log('Jval is ', jVal)
        return jVal
        
    };

    const [fields, setFields] = useState([]);
    const [formData, setFormData] = useState([]);
    let [formDataInputs, setFormDataInputs] = useState({});
    console.log('Form Data', formData)

    const amtsData = [
        {id: 'остаток'},
        {id: 'продажа'}
    ]

    useEffect(() => {
        const loadFields = async () => {
            const fetchedFields = await fetchFormFields();
            console.log('fetched', fetchedFields)
            setFields(fetchedFields);
            // Инициализируем состояние formData с пустыми значениями
            const initialFormData = fetchedFields.reduce((acc, field) => {
                acc[field.id] = field.cnt;

                return acc;
            }, {});
            setFormData(initialFormData);
            console.log('CafeFormData ', fields)
        };
        loadFields();
    }, []);

    const handleChange = (value, id) => {


        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
        formDataInputs = formData;
    };

    const handleInput = (e) => {
        const id = e.target['id'];
        const value = e.target['value'].toString().replace(/\s/g, '');
        console.log('e ', e.target['value'])

        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));

    };

    const handleSubmit = () => {
        var date = new Date();
        const updDateTime = date.getFullYear() + '-' +
            ('00' + (date.getMonth() + 1)).slice(-2) + '-' +
            ('00' + date.getDate()).slice(-2) + ' ' +
            ('00' + date.getHours()).slice(-2) + ':' +
            ('00' + date.getMinutes()).slice(-2) + ':' +
            ('00' + date.getSeconds()).slice(-2);
        fetch(APIURL + '/sendCafeRems', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...formData, initData: window.Telegram.WebApp.initData, datetime: updDateTime })
        })
        navigate('/', {
            replace: true,
            state: { sent: true }
        });


    }


    return (
        <div >
            
           
       
            <h4 className={styles.header}>Остатки кафе</h4>
            <Group className={styles.container}>{fields.map((field) => {
                return (
                    <div  key={field.id}>
                        <productField className={styles.productField} id={field.id} value={formData[field.id]} aria-label="e"
                            minValue={0}
                            // description={field.name}
                            // isRequired={true}
                            onInput={handleInput}
                            >
                                 <Label className={styles.productName} >{field.id}
                                   
                                   
                            <div className={styles.inputLine}>{amtsData.map((amtsData) => {
                                return (
                                <><NumberField key={amtsData.id}
                                        className={styles.numberField} id={amtsData.id} value={amtsData[field.id]}
                                        onChange={(v) => handleChange(v, field.id)} aria-label="i">
                                        <Label className={styles.inputtype}>{amtsData.id} </Label>
                                        <div className={styles.inputAndIncDec}>
                                        <Button className={styles.reactAriaButton} slot="decrement">&minus;</Button>
                                        <Input className={styles.input} />
                                        <Button className={styles.reactAriaButton} slot="increment">+</Button>
                                        </div>
                                    </NumberField></>
                            )
                        })}
                            </div>
                            </Label>
                        </productField>
                        
                    </div>
                )
            })}</Group>
       
        <Button className={styles.submit} onPress={handleSubmit}  >Отправить</Button>
       
        </div>
    )

}

export default CafeRems;