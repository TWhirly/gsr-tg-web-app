import React, { useCallback, useEffect, useState, useRef, Component } from 'react';
import styles from './HotDog.module.css';
import { localUrl } from '../../localSettings.js'
import '/node_modules/animate.css/animate.css';
import { useNavigate, useHistory } from "react-router-dom";
import { NumberField, Label, Group, Input, Button, Cell, Column, Row, Table, TableBody, TableHeader, Text } from 'react-aria-components';


const APIURL = localUrl.APIURL;



const HotDog = () => {
    // localStorage.removeItem('tempFormData')
    const navigate = useNavigate();

    const fetchFormFields = async () => {
        const response = await fetch(APIURL + '/hotdog/', {
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




    const amtsData = [
        { id: 'остаток' },
        { id: 'продажа' },
        { id: 'списание' },
        { id: 'заказ' }
    ]

    useEffect(() => {
        const storedData = localStorage.getItem('tempHotDogFormData');
        // if (storedData && storedData.date == (new Date()).toLocaleDateString()) {
        if (storedData) {

            console.log('local stored data', JSON.parse(storedData));
            const storedDataObj = JSON.parse(storedData);
            if (storedDataObj.date !== (new Date()).toLocaleDateString()) {
                localStorage.removeItem('tempHotDogFormData');
                return
            }
            delete storedDataObj.date
            const fetchedFields = [];
            const show = new Map();

            Object.keys(storedDataObj).forEach((key) => {
                fetchedFields.push({
                    id: key, 'остаток': key['остаток'], 'продажа': key['продажа'],
                    'списание': key['списание'], 'заказ': key['заказ']
                });
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
                    acc[field.id] = { 'остаток': field.cnt};

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

    const handleChange = (value, id, field) => {
        setToggleClear(false);
        setFormData((prevData) => ({
            ...prevData,
            [id]: { [field]: value }

        }));
        recievedFormData[id][field] = value;
        const date = (new Date()).toLocaleDateString();
        localStorage.setItem('tempHotDogFormData', JSON.stringify({ ...recievedFormData, date: date }))
    };

    const clearOnFocus = (v, id, field) => {
        recievedFormData[id][field] = NaN 
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
        fetch(APIURL + '/ss', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...recievedFormData, initData: window.Telegram.WebApp.initData, datetime: updDateTime })
        })
        localStorage.removeItem('tempHotDogFormData')
        navigate('/', {
            replace: true,
            state: { sent: true }
        });
    }

    return (
        <div>
            <h4 className={styles.header}>Ингредиенты для хот-догов
              
            </h4>
            <Group className={styles.container}>

                {fields.map((field) => {
                    return (
                        <div key={field.id}>
                            <div
                                className={`${styles.productField} ${!showAdditionalFields.get(field.id) ? styles.default : styles.show}`}
                                id={field.id}
                                aria-label="e"
                                minValue={0}
                            >
                                <Label className={styles.productName}>{field.id}</Label>
                                <div className={styles.inputLine}>
                                    
                                            <NumberField
                                                key={amtsData.id}
                                                className={styles.numberField}
                                                id={amtsData.id}
                                                value={recievedFormData[field.id][amtsData.id]}
                                                minValue={0}
                                                onFocus={(v) => clearOnFocus(v, field.id, amtsData.id)}
                                                onChange={(v) => handleChange(v, field.id, amtsData.id)}
                                                aria-label="i"
                                            >
                                                <Label className={styles.inputtype}>{amtsData.id}</Label>
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
                <Button className={styles.submit} onPress={handleSubmit} >Отправить</Button>
            </Group>

        </div>

    );

}

export default HotDog;