import React, { useCallback, useEffect, useState, useRef, Component } from 'react';
import styles from './shopOrders.module.css';
import { localUrl } from '../../localSettings.js'
import '/node_modules/animate.css/animate.css';
import { useNavigate, useHistory } from "react-router-dom";
import { NumberField, Label, Group, Input, Button, Cell, Column, Row, Table, TableBody, TableHeader, Text } from 'react-aria-components';


const APIURL = localUrl.APIURL;



const ShopOrders = () => {
    const navigate = useNavigate();

    const fetchFormFields = async () => {
        const response = await fetch(APIURL + '/shopOrders/', {
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
    const [recievedFormData, setRecievedFormData] = useState({});
    const [showAdditionalFields, setShowAdditionalFields] = useState(new Map());
    const [toggleState, setToggleState] = useState(false);
    const [toggleClear, setToggleClear] = useState(false);




    

    useEffect(() => {
            const loadFields = async () => {
                const fetchedFields = await fetchFormFields();
                console.log('fetched', fetchedFields, typeof (fetchedFields))
                setFields(fetchedFields);
                const uniqueDates = new Map();
                // Инициализируем состояние formData с пустыми значениями
               

                const result = fetchedFields.reduce((acc, { date, ca, station, nomenclature, amt }) => {
                    // Если дата еще не добавлена в аккумулятор, создаем объект для нее
                    if (!acc[date]) {
                        acc[date] = {};
                    }
                
                    // Если ca еще не добавлен для данной даты, создаем массив для него
                    if (!acc[date][ca]) {
                        acc[date][ca] = [];
                    }
                
                    // Добавляем объект с остальными данными в массив для данного ca
                    acc[date][ca].push({ station, nomenclature, amt });
                
                    return acc;
                }, {});
                
                // Преобразуем объект в массив
                const initialFormData = Object.entries(result).map(([date, caData]) => ({
                    date,
                    ca: Object.entries(caData).map(([ca, values]) => ({
                        ca,
                        data: values
                    }))
                }));

                setFormData(initialFormData);
                setRecievedFormData(initialFormData);

            };

            loadFields();
    }, []);


    useEffect(() => {
        setShowAdditionalFields(showAdditionalFields)
    }, [showAdditionalFields, toggleState])

    const handleChange = (value, id) => {
        setToggleClear(false);
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
        recievedFormData[id] = value;
        const date = (new Date()).toLocaleDateString();
    };

    
    console.log('rec', fields)
    console.log('form ', (formData[0]["date"]), 'type ', typeof(formData[0]))
    return (
        <div>
            <h4 className={styles.header}>Заявки по магазину
              
            </h4>
            <Group className={styles.container}>

                {formData.map((field) => {
                    return (
                        <div key={field.date}>{field.date}
                        {typeof(field['ca'])}
                        {/* {field['ca'].map((ca) => {
                            return (
                                <div>{field.ca}</div>
                            )
                        })} */}
                           
                        </div>
                    );
                })}
            </Group>

        </div>

    );

}

export default ShopOrders;