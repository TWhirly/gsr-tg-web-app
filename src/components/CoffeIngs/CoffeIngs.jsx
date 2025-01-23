import React, { useCallback, useEffect, useState, useRef, Component, useContext } from 'react';
import styles from './CoffeIngs.module.css';
import { localUrl } from '../../localSettings.js'
import '/node_modules/animate.css/animate.css';
import { useNavigate, useHistory } from "react-router-dom";
import { NumberField, Label, Group, Input, Button, Cell, Column, Row, Table, TableBody, TableHeader, Text } from 'react-aria-components';
// const { stationId } = useContext(DataContext);
import { DataContext } from '../../DataContext';


const APIURL = localUrl.APIURL;



const CoffeIngs = () => {
    // localStorage.removeItem('tempHotDogFormData');
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
    const { stationId } = useContext(DataContext);




    

    useEffect(() => {
        const storedData = localStorage.getItem(stationId+'CoffeIngsData');
        // if (storedData && storedData.date == (new Date()).toLocaleDateString()) {
        if (storedData) {

            console.log('local stored data', JSON.parse(storedData));
            let storedDataObj = JSON.parse(storedData);
            if (storedDataObj.date !== (new Date()).toLocaleDateString()) {
                localStorage.removeItem(stationId+'CoffeIngsData');
                return
            }
            console.log('st d date', storedDataObj.date)
            delete storedDataObj.date
            console.log('local stored data2', storedDataObj);
            const fetchedFields = [];
            const show = new Map();

            Object.keys(storedDataObj).forEach((key) => {
                fetchedFields.push({
                    id: key});
                show.set(key, false);
            });

            setFields(fetchedFields);
            
            
            setFormData(storedDataObj);
            setRecievedFormData(storedDataObj);
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

                    acc[field.cat][field.id] = {amt: field.cnt, unit: field.unit, order: NaN}

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

    const handleChange = (v, cat, field) => {
        console.log('recieved f data', cat, field, v)
        setToggleClear(false);
        console.log('rec2', recievedFormData)
        recievedFormData[cat][field]['amt'] = v;
        const date = (new Date()).toLocaleDateString();
        localStorage.setItem(stationId+'CoffeIngsData', JSON.stringify({ ...formData, date: date }))
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
        localStorage.removeItem(stationId+'CoffeIngsData')
        navigate('/', {
            replace: true,
            state: { sent: true }
        });
    }
    console.log('rec', recievedFormData)
    return (
        <div className={styles.container}>
            <div className={styles.header}>Ингредиенты КМ </div>
            <div className={styles.catContainer}>
                {Object.keys(formData).map(cat => (

                    <div className={styles.catBlock}> {cat}

                        {Object.keys(formData[cat]).map((field) => {
                            return (
                                <div key={field.id}>

                                    <div className={styles.inputLine}>
                                        <NumberField
                                            key={field}
                                            className={styles.numberField}
                                            defaultValue={recievedFormData[cat][field]['amt']}
                                            value={recievedFormData[cat[field['amt']]]}
                                            onChange={(v) => handleChange(v, cat, field)}
                                           
                                        >
                                            <Label className={styles.inputtype}>{field}, {formData[cat][field]['unit']}</Label>
                                            <div className={styles.inputAndIncDec}>
                                                <Button className={styles.reactAriaButton} slot="decrement">&minus;</Button>
                                                <Input
                                                className={styles.input}
                                               
                                                
                                                />
                                                <Button className={styles.reactAriaButton} slot="increment">+</Button>
                                            </div>
                                        </NumberField>

                                    </div>

                                </div>
                            );
                        })}


                    </div>
                ))}
                 <Button className={styles.submit} onPress={handleSubmit}>Отправить</Button>
            </div>
           
        </div>

    );

}

export default CoffeIngs;