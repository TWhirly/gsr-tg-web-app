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
    const [formData, setFormData] = useState({});
    const [recievedFormData, setRecievedFormData] = useState({});
    const [showAdditionalFields, setShowAdditionalFields] = useState(new Map());
    const [toggleState, setToggleState] = useState(false);
    const [toggleClear, setToggleClear] = useState(false);






    useEffect(() => {
        const loadFields = async () => {
            const fetchedFields = await fetchFormFields();
            console.log('fetched', fetchedFields, typeof (fetchedFields))
            setFields(fetchedFields);

            fetchedFields.forEach((key) => {
                showAdditionalFields.set(key.date + key.ca, false)
            });

            console.log('additional', showAdditionalFields)


            const initialFormData = fetchedFields.reduce((acc, item) => {
                if (!acc[item.date]) {
                    acc[item.date] = {};
                }
                if (!acc[item.date][item.ca]) {
                    acc[item.date][item.ca] = {};
                }
                acc[item.date][item.ca][item.nomenclature] = item.amt;
            
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

    const showAll = (e, name) => {
        console.log('e.target', name)
        setToggleState(toggleState == true ? false : true)
        if (showAdditionalFields.get(name) === true) {
            showAdditionalFields.set(name, false)
        }
        else {
            showAdditionalFields.set(name, true)
        }
        setShowAdditionalFields(showAdditionalFields)
    }

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
    // console.log('keys ',Object.keys(formData['18.11.2024']['Юринат БТД']))
    console.log(showAdditionalFields.get('29.11.2024Трейд'))
    return (
        <div className={styles.container}>
            {Object.keys(formData).map(date => (
                <div className={styles.dateBlock} key={date}>
                    <h2>{date}</h2>
                    {Object.keys(formData[date]).map(ca => (
                        <div className={styles.caBlock} key={ca}>
                            <h3>{ca}</h3>
                            <div>
                            {Object.keys(formData[date][ca]).filter((nomenclature) => Object.keys(formData[date][ca]).indexOf(nomenclature) < 3).map((nomenclature) => (
                                <div className={`${styles.nomenclatureBlock} ${!showAdditionalFields.get(ca + nomenclature) ? '' : styles.hide}`} key={ca.nomenclature}>
                                    {Object.keys(formData[date][ca]).indexOf(nomenclature) + 1} {nomenclature} - {formData[date][ca][nomenclature]}
                                    {showAdditionalFields.get(ca + nomenclature) ? 'show' : 'hide'}
                                </div>
                            ))}
                            <div 
                            name={date + ca}
                            onClick={(e) => showAll(e, date+ca)}
                            >
                            {Object.keys(formData[date][ca]).length > 3 ? 'Показать все (' + Object.keys(formData[date][ca]).length +')' : ''}
                            </div>
                            </div>
                            {Object.keys(formData[date][ca]).map((nomenclature) => (
                                <div className={`${styles.nomenclatureBlock} ${showAdditionalFields.get(ca + nomenclature) ? '' : styles.hide}`} key={ca.nomenclature}>
                                    {Object.keys(formData[date][ca]).indexOf(nomenclature) + 1} {nomenclature} - {formData[date][ca][nomenclature]}
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