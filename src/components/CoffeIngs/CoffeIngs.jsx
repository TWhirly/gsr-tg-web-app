import React, { useCallback, useEffect, useState, useRef, Component } from 'react';
import styles from './CoffeIngs.module.css';
import { localUrl } from '../../localSettings.js'
import '/node_modules/animate.css/animate.css';
import { useNavigate, useHistory } from "react-router-dom";
import { NumberField, Label, Group, Input, Button, Cell, Column, Row, Table, TableBody, TableHeader, Text } from 'react-aria-components';


const APIURL = localUrl.APIURL;



const CoffeIngs = () => {
    localStorage.removeItem('tempHotDogFormData');
    const navigate = useNavigate();

    const fetchFormFields = async () => {
        const response = await fetch(APIURL + '/CoffeIngs/', {
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
        localStorage.removeItem('CoffeIngsData')
        const storedData = localStorage.getItem('CoffeIngsData');
        // if (storedData && storedData.date == (new Date()).toLocaleDateString()) {
        if (storedData) {

            console.log('local stored data', JSON.parse(storedData));
            const storedDataObj = JSON.parse(storedData);
            if (storedDataObj.date !== (new Date()).toLocaleDateString()) {
                localStorage.removeItem('CoffeIngsData');
                return
            }
            delete storedDataObj.date
            const fetchedFields = [];
            const show = new Map();

            Object.keys(storedDataObj).forEach((key) => {
                fetchedFields.push({
                    id: key});
                show.set(key, false);
            });

            setFields(fetchedFields);
            
            
            setFormData(JSON.parse(storedData));
            setRecievedFormData(JSON.parse(storedData));
            setToggleState(toggleState == true ? false : true)
        }
        
        else {
            const loadFields = async () => {
                const fetchedFields = await fetchFormFields();
                console.log('fetched', fetchedFields, typeof (fetchedFields))
                setFields(fetchedFields);
                // Инициализируем состояние formData с пустыми значениями
               

                const initialFormData = fetchedFields.reduce((acc, field) => {
                    if(!acc[field.cat]){ 
                        acc[field.cat] = {};
                    }
                    if(!acc[field.cat][field.id]){
                        acc[field.cat][field.id] = {}
                    }

                    acc[field.cat][field.id] = {amt: field.cnt, unit: field.unit}

                    return acc;
                }, {});
                setFormData(initialFormData);
                setRecievedFormData(initialFormData);

            };

            loadFields();

        }
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
        localStorage.setItem('CoffeIngsData', JSON.stringify({ ...recievedFormData, date: date }))
    };

    const clearOnFocus = (e) => {
        const id = e.target.id
        recievedFormData[id] = NaN
        setToggleState(toggleState == true ? false : true)

    }

    const handleSubmit = () => {
        delete recievedFormData.date;
        var date = new Date();
        const updDateTime = date.getFullYear() + '-' +
            ('00' + (date.getMonth() + 1)).slice(-2) + '-' +
            ('00' + date.getDate()).slice(-2) + ' ' +
            ('00' + date.getHours()).slice(-2) + ':' +
            ('00' + date.getMinutes()).slice(-2) + ':' +
            ('00' + date.getSeconds()).slice(-2);
            console.log('trying to submit ', recievedFormData)
        fetch(APIURL + '/sendCoffeIngs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...recievedFormData, initData: window.Telegram.WebApp.initData, datetime: updDateTime })
        })
        localStorage.removeItem('CoffeIngsData')
        navigate('/', {
            replace: true,
            state: { sent: true }
        });
    }
    console.log('rec', recievedFormData)
    return (
        <div className={styles.container}>
            <h4 className={styles.header}>Ингредиенты КМ </h4>
            {Object.keys(formData).map(cat => (
               
            <div > {cat}

                {Object.keys(formData[cat]).map((field) => {
                    return (
                        <div key={field.id}>
                            <div
                                className={styles.productField}
                                id={field.id}
                                aria-label="e"
                                minValue={0}
                            >
                                <div className={styles.inputLine}>
                                    
                                            <NumberField
                                                key={field.id}
                                                className={styles.numberField}
                                                id={field.id}
                                                value={recievedFormData[field.id]}
                                                name={field.id}
                                                minValue={0}
                                                onFocus={clearOnFocus}
                                                onChange={(v) => handleChange(v, field, field.unit)}
                                                aria-label="i"
                                            >
                                                <Label className={styles.inputtype}>{field}, {formData[cat][field]['unit']}</Label>
                                                <div className={styles.inputAndIncDec}>
                                                    <Button className={styles.reactAriaButton} slot="decrement">&minus;</Button>
                                                    <Input className={styles.input} />
                                                    <Button className={styles.reactAriaButton} slot="increment">+</Button>
                                                </div>
                                            </NumberField>
                                  
                                </div>
                            </div>
                        </div>
                    );
                })}
                
              
            </div>
    ))}
      <Button className={styles.submit} onPress={handleSubmit} >Отправить</Button>
        </div>

    );

}

export default CoffeIngs;