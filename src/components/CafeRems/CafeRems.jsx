import React, { useCallback, useEffect, useState, useRef, Component } from 'react';
import styles from './CafeRems.module.css';
import { localUrl } from '../../localSettings.js'
import '/node_modules/animate.css/animate.css';
import { useNavigate, useHistory } from "react-router-dom";
import { NumberField, Label, Group, Input, Button, Cell, Column, Row, Table, TableBody, TableHeader, Text } from 'react-aria-components';
// import expandLogo from '../../icons/angle-small-down.svg'
// import decreaseLogo from '../../icons/angle-small-up.svg'
import { AngleDown, AngleUp, AngleDoubleDown, AngleDoubleUp, Broom } from '../../icons/SVG.js'
import { useLinkProps } from '@react-aria/utils';
import { useTelegram } from "../../hooks/useTelegram.js";
import { type } from '@testing-library/user-event/dist/type/index.js';


const APIURL = localUrl.APIURL;



const CafeRems = () => {
    // localStorage.removeItem('tempFormData')
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
    const [formData, setFormData] = useState({});
    const [recievedFormData, setRecievedFormData] = useState({});
    const [showAdditionalFields, setShowAdditionalFields] = useState(new Map());
    const [toggleState, setToggleState] = useState(false);
    const [toggleClear, setToggleClear] = useState(false);

    console.log('Form Data', formData)


    const amtsData = [
        { id: 'остаток' },
        { id: 'продажа' },
        { id: 'списание' },
        { id: 'заказ' }
    ]

    useEffect(() => {
        const storedData = localStorage.getItem('tempFormData');
        // if (storedData && storedData.date == (new Date()).toLocaleDateString()) {
        if (storedData) {

            console.log('local stored data', JSON.parse(storedData));
            const storedDataObj = JSON.parse(storedData);
            if (storedDataObj.date !== (new Date()).toLocaleDateString()) {
                localStorage.removeItem('tempFormData');
                return
            }
            delete storedDataObj.date
            const fetchedFields = [];
            Object.keys(storedDataObj).forEach((key) => {
                fetchedFields.push({
                    id: key, 'остаток': key['остаток'], 'продажа': key['продажа'],
                    'списание': key['списание'], 'заказ': key['заказ']
                })
            })
            setFields(fetchedFields);
            setFormData(JSON.parse(storedData));
            setRecievedFormData(JSON.parse(storedData));
        }
        else {
            const loadFields = async () => {
                const fetchedFields = await fetchFormFields();
                console.log('fetched', fetchedFields, typeof (fetchedFields))
                setFields(fetchedFields);
                // Инициализируем состояние formData с пустыми значениями

                const show = new Map();
                fetchedFields.forEach((key) => {
                    show.set(key.id, false)
                })
                setShowAdditionalFields(show);

                const initialFormData = fetchedFields.reduce((acc, field) => {
                    // acc[field.id] = field.cnt;
                    acc[field.id] = { 'остаток': field.cnt == null || field.cnt == 0 ? NaN : field.cnt, 'продажа': NaN, 'списание': NaN, 'заказ': NaN };

                    return acc;
                }, {});
                console.log('initial', initialFormData)
                // setFields(initialFormData);
                setFormData(initialFormData);
                setRecievedFormData(initialFormData);


                console.log('CafeFormData ', formData, typeof (formData))
            };
            loadFields();
        }
    }, []);

    useEffect(() => {
        setShowAdditionalFields(showAdditionalFields)
    }, [showAdditionalFields, toggleState])

    const handleChange = (value, id, field) => {
        console.log('onChange ', value, id, field)
        setFormData((prevData) => ({
            ...prevData,
            [id]: { [field]: value }

        }));
        recievedFormData[id][field] = value;
        console.log('recieved', recievedFormData)
        const date = (new Date()).toLocaleDateString();
        localStorage.setItem('tempFormData', JSON.stringify({ ...recievedFormData, date: date }))
    };

    useEffect(() => {
        setToggleClear(toggleClear)
        
    }), [toggleClear]


    const clearForm = () => {
        const clearData = {};
        Object.keys(formData).forEach((key) => {
            clearData[key] = {
                 'остаток': NaN, 'продажа': NaN,
                'списание': NaN, 'заказ': NaN
            }
        })
        
        console.log(clearData)
        setFormData(clearData);
        setToggleClear(toggleClear == true ? false : true)
        console.log('reset', fields)
        
    }

  

    const toggleAdditionalFields = (fieldID) => {
        console.log('we are here!')
        setToggleState(toggleState == true ? false : true)
        if (showAdditionalFields.get(fieldID) === true) {
            showAdditionalFields.set(fieldID, false)
        }
        else {
            showAdditionalFields.set(fieldID, true)
        }
        setShowAdditionalFields(showAdditionalFields)
    }

    const toggleAllAdditionalFields = () => {
        console.log(`toggle!`)
        setToggleState(toggleState == true ? false : true)
        if (
            Array.from(showAdditionalFields.values()).includes(false)) {
            [...showAdditionalFields.keys()].forEach((key) => {
                showAdditionalFields.set(key, true);
            })
        }
        else {
            [...showAdditionalFields.keys()].forEach((key) => {
                showAdditionalFields.set(key, false);
            })
        }
    }



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
            body: JSON.stringify({ ...recievedFormData, initData: window.Telegram.WebApp.initData, datetime: updDateTime })
        })
        localStorage.removeItem('tempFormData')
        navigate('/', {
            replace: true,
            state: { sent: true }
        });
    }
    console.log('render')
    return (
        <div>
            <h4 className={styles.header}>Отчёт по кафе
                {(Array.from(showAdditionalFields.values()).includes(true) &&
                    <div className={styles.mainExpButtContainer} onClick={toggleAllAdditionalFields}>
                        <AngleDoubleUp
                            className={styles.mainExpandButtonDown}
                        >
                        </AngleDoubleUp></div>)}
                {(Array.from(showAdditionalFields.values()).includes(false) &&
                    <div className={styles.mainExpButtContainer} onClick={toggleAllAdditionalFields}>
                        <AngleDoubleDown
                            className={styles.mainExpandButtonDown}
                        >
                        </AngleDoubleDown></div>)}
                <div onClick={clearForm}>

                    <Broom
                        className={styles.broom}
                    >
                    </Broom></div>

            </h4>
            <Group className={styles.container}>

                {fields.map((field) => {
                    return (
                        <div key={field.id}>
                            <productField
                                className={`${styles.productField} ${!showAdditionalFields.get(field.id) ? styles.default : styles.show}`}
                                id={field.id}
                                // value={formData[field.id]}
                                aria-label="e"
                                minValue={0}
                            >
                                <Label className={styles.productName}>{field.id}</Label>
                                <div className={`${styles.inputLine} ${!showAdditionalFields.get(field.id) ? styles.default : styles.show}`}>
                                    {amtsData.filter(item => item.id === 'остаток' || item.id === 'продажа').map(amtsData => {
                                        return (
                                            <NumberField
                                                key={amtsData.id}
                                                className={styles.numberField}
                                                id={amtsData.id}
                                                // value={amtsData[field.id]}
                                                // value={formData[field.id][amtsData[field.id]]}
                                                minValue={0}
                                                // defaultValue={amtsData.id === 'продажа' ? 0 : field.cnt}
                                                defaultValue={formData[field.id][amtsData.id]}
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
                                        );
                                    })}
                                </div>

                                <div className={`${styles.additionalField} ${showAdditionalFields.get(field.id) ? styles.show : ''}`}>
                                    {amtsData.filter(item => item.id === 'списание' || item.id === 'заказ').map(amtsData => {
                                        return (

                                            <NumberField
                                                key={amtsData.id}
                                                className={`${styles.numberField} ${!showAdditionalFields.get(field.id) ? styles.hide : ''}`}
                                                id={amtsData.id}
                                                // value={amtsData[field.id]}
                                                minValue={0}
                                                defaultValue={formData[field.id][amtsData.id]}
                                                isReadOnly={!showAdditionalFields.get(field.id)}
                                                onChange={(v) => handleChange(v, field.id, amtsData.id)}
                                                aria-label="i"
                                            >
                                                <Label className={styles.inputtype}>
                                                    {amtsData.id}</Label>
                                                <div className={styles.inputAndIncDec}>
                                                    <Button className={styles.reactAriaButton} slot="decrement">&minus;</Button>
                                                    <Input className={styles.input} />
                                                    <Button className={styles.reactAriaButton} slot="increment">+</Button>
                                                </div>
                                            </NumberField>
                                        );
                                    })}</div>
                                {(!showAdditionalFields.get(field.id) && <div onClick={(v) => toggleAdditionalFields(field.id)}>
                                    {(<AngleDown
                                        className={`${styles.expandButton} ${!showAdditionalFields.get(field.id) ? styles.down : ''}`}
                                    >
                                    </AngleDown>)}</div>)}
                                {(showAdditionalFields.get(field.id) && <div onClick={(v) => toggleAdditionalFields(field.id)}>
                                    {(<AngleUp
                                        className={`${styles.expandButton} ${showAdditionalFields.get(field.id) ? styles.up : ''}`}
                                    >
                                    </AngleUp>)}</div>)}
                            </productField>
                        </div>
                    );
                })}
                <Button className={styles.submit} onPress={handleSubmit} >Отправить</Button>
            </Group>

        </div>

    );

}

export default CafeRems;