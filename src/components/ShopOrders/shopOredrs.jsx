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
               

                const initialFormData = fetchedFields.reduce((acc, item) => {
                    if (!acc[item.date]) {
                        acc[item.date] = {};
                    }
                    if (!acc[item.date][item.ca]) {
                        acc[item.date][item.ca] = [];
                    }
                    if (!acc[item.date][item.ca][item.nomenclature]) {
                        acc[item.date][item.ca][item.nomenclature] = [];
                    }
                   
                   
                    acc[item.date][item.ca][item.nomenclature].push(item.amt);
                    return acc;
                }, {});

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

    
    console.log('rec', formData)
    // console.log('form ', formData[date][ca][nomenclature], 'type ', typeof(formData[date][ca][nomenclature]))
    // console.log(Object.values(t))
    return (
        <div>
            {Object.keys(formData).map(date => (
                <div key={date}>
                    <h2>{date}</h2>
                    {Object.keys(formData[date]).map(ca => (
                        <div key={ca}>
                            <h3>{ca}</h3>
                            {Object.keys(formData[date][ca]).map((nomenclature) => (
                                <div key = {ca.nomenclature}>
                                    {nomenclature} - {formData[date][ca][nomenclature]}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );

}

export default ShopOrders;