import React, { useCallback, useEffect, useState, useRef, Component, useContext } from 'react';
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
import IntField from '../InputFields/NumField.jsx';
import NumField from '../InputFields/NumField.jsx';
import { DataContext } from '../../DataContext';



const APIURL = localUrl.APIURL;



const CafeRems = () => {
    // localStorage.removeItem(stationId+'tempCafeData')
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
    const [buttonPressed, setButtonPressed] = useState(false);
    const { stationId } = useContext(DataContext);
    const {tg, queryId} = useTelegram();

    tg.MainButton.show();

    const amtsData = [
        { id: 'остаток' },
        { id: 'продажа' },
        { id: 'списание' },
        { id: 'заказ' }
    ]

    useEffect(() => {
        const storedData = localStorage.getItem(stationId+stationId+'tempCafeData');
        // if (storedData && storedData.date == (new Date()).toLocaleDateString()) {
        if (storedData) {

            console.log('local stored data', JSON.parse(storedData));
            const storedDataObj = JSON.parse(storedData);
            if (storedDataObj.date !== (new Date()).toLocaleDateString()) {
                localStorage.removeItem(stationId+'tempCafeData');
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
            
            fetchedFields.forEach((key) => {
                showAdditionalFields.set(key.id, false)
            });
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
                const show = new Map();
                fetchedFields.forEach((key) => {
                    show.set(key.id, false)
                })
                setShowAdditionalFields(show);

                const initialFormData = fetchedFields.reduce((acc, field) => {
                    acc[field.id] = { 'остаток': field.cnt, 'продажа': 0, 'списание': 0, 'заказ': 0 };

                    return acc;
                }, {});
                setFormData(initialFormData);
                setRecievedFormData(initialFormData);

            };

            loadFields();
            console.log('fields ', fields)
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
        localStorage.setItem(stationId+'tempCafeData', JSON.stringify({ ...recievedFormData, date: date }))
    };

    useEffect(() => {
        setToggleClear(toggleClear)

    }), [setToggleClear, toggleClear]


    const clearForm = () => {
        setToggleClear(true)
        const clearData = formData;
        Object.keys(recievedFormData).forEach((key) => {
            recievedFormData[key] = {
                'остаток': 0, 'продажа': 0,
                'списание': 0, 'заказ': 0
            }
        })
        const date = (new Date()).toLocaleDateString();
        localStorage.setItem(stationId+'tempCafeData', JSON.stringify({ ...recievedFormData, date: date }))
    }

    // const clearOnFocus = (v, id, field) => {
    //     console.log('on focus ', id, field)
    //     recievedFormData[id][field] = NaN 
    //     setToggleState(toggleState == true ? false : true)

    // }

    const clearOnFocus = (e) => {
        if (buttonPressed) {
            console.log('Курсор установлен с кнопки');
        } else {
            console.log('Курсор установлен в поле ввода');
        }
        const id = e.target.id
        const field = e.target.ariaLabel
        console.log('on focus ', id, field)
        console.log(typeof(e.target.ariaLabel))
        console.log(Object.keys(e.target))
        console.log('title ',(e))
        // recievedFormData[id][field] = NaN 
        

    }

    const handleFocus2 = () => {
        console.log('handle2')
    }

    const buttonFocus =() => {
        console.log('btn fcs')
        setButtonPressed(true);
    }


    const toggleAdditionalFields = (fieldID) => {
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
        delete recievedFormData.date;
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
        localStorage.removeItem(stationId+'tempCafeData')
        navigate('/', {
            replace: true,
            state: { sent: true }
        });
    }

    useEffect(() => {
        tg.onEvent('mainButtonClicked', handleSubmit)
        return () => {
            tg.offEvent('mainButtonClicked', handleSubmit)
        }
    }, [handleSubmit])


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
                                <div className={`${styles.inputLine} ${!showAdditionalFields.get(field.id) ? styles.default : styles.show}`}>
                                    {amtsData.filter(item => item.id === 'остаток' || item.id === 'продажа').map(amtsData => {
                                        return (
                                            <NumberField
                                                // key={amtsData.id}
                                                name={field.id}
                                                className={styles.numberField}
                                                id={amtsData.id}
                                                value={recievedFormData[field.id][amtsData.id]}
                                                minValue={0}
                                                // onBeforeInput={(v) => clearOnFocus(v, field.id, amtsData.id)}
                                                // onFocus={clearOnFocus}
                                                onChange={(v) => handleChange(v, field.id, amtsData.id)}
                                                aria-label={field.id}
                                            >
                                                <Label className={styles.inputtype}>{amtsData.id}</Label>
                                                <div className={styles.inputAndIncDec}>
                                                    <Button className={styles.reactAriaButton} slot="decrement" >&minus;</Button>
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
                                                value={recievedFormData[field.id][amtsData.id]}
                                                minValue={0}
                                                isReadOnly={!showAdditionalFields.get(field.id)}
                                                onChange={(v) => handleChange(v, field.id, amtsData.id)}
                                                // onFocus={(v) => clearOnFocus(v, field.id, amtsData.id)}
                                                aria-label="i"
                                            >
                                                <Label className={`${styles.inputtype} ${!showAdditionalFields.get(field.id) ? styles.hide : ''}`}>
                                                    {amtsData.id}</Label>
                                                <div className={`${styles.inputAndIncDec} ${!showAdditionalFields.get(field.id) ? styles.hide : ''}`}>
                                                    <Button className={`${styles.reactAriaButton} ${!showAdditionalFields.get(field.id) ? styles.hide : ''}`} slot="decrement">&minus;</Button>
                                                    <Input className={`${styles.input} ${!showAdditionalFields.get(field.id) ? styles.hide : ''}`}  />
                                                    <Button className={`${styles.reactAriaButton} ${!showAdditionalFields.get(field.id) ? styles.hide : ''}`} slot="increment">+</Button>
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
                            </div>
                        </div>
                    );
                })}
                {/* <Button className={styles.submit} onPress={handleSubmit} >Отправить</Button> */}
            </Group>

        </div>

    );

}

export default CafeRems;