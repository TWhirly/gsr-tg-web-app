import React, { useCallback, useEffect, useState, useLayoutEffect, useRef } from 'react';
import styles from './ShiftRep.module.css';
import { localUrl } from '../../localSettings.js'
import 'animate.css';
import CircularProgress from '@mui/joy/CircularProgress';
import Box from '@mui/joy/Box';
import { useNavigate, useHistory } from "react-router-dom";
import { NumberField, Label, Group, Input, Button, Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';
import { useLinkProps } from '@react-aria/utils';
import { useTelegram } from "../../hooks/useTelegram";
import { type } from '@testing-library/user-event/dist/type/index.js';
import { Element, Events, animateScroll as scroll, Link } from 'react-scroll';

// import { Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';

const APIURL = localUrl.APIURL;



const ShiftRep = () => {
    const navigate = useNavigate();
    const myRef = useRef();

    const fetchFormFields = async () => {
        const response = await fetch(APIURL + '/shiftReport', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ initData: window.Telegram.WebApp.initData })
        }); // Генерируем объект Response
        const jVal = await response.json(); // Парсим тело ответа
        return jVal
    };



    const [fields, setFields] = useState([]);
    const [fieldsCal, setFieldsCal] = useState([]);
    const [formData, setFormData] = useState({});
    const [cal, setCal] = useState({});
    const [recievedFormData, setRecievedFormData] = useState({});
    const [formDataInputs, setFormDataInputs] = useState({});
    const [haveChanges, setIsChangesExist] = useState(false);
    const [calibLoad, setCalibLoad] = useState(false)
    const [formLoad, setFormLoad] = useState(false)
    const [densTempShow, setDensTempshow] = useState(new Map())
    const [toggleState, setToggleState] = useState(false);
    const [isFieldsFilled, setfieldsFilled] = useState(false);
    const [loadedFromLocal, setLoadedFromLocal] = useState(true)
    const [totFuel, setTotFuel] = useState('')
    const [totFuelWord, setTotFuelWord] = useState('')



    useEffect(() => {



        const loadFields = async () => {
            let fetchedFields
            let initialFormData
            const storedData = localStorage.getItem('tempShiftData');



            if (storedData) {
                setLoadedFromLocal(true)
                const storedDataObj = JSON.parse(storedData);
                console.log('stored', storedDataObj)
                if (storedDataObj.date !== (new Date()).toLocaleDateString()) {
                    localStorage.removeItem('tempShiftReportData');
                    return
                }
                delete storedDataObj.date
                fetchedFields = [];
                Object.keys(storedDataObj).forEach(key => {
                    storedDataObj[key]['id'] = key
                    fetchedFields.push(storedDataObj[key])
                })
                setIsChangesExist(true)
                console.log('fetched from stored', fetchedFields)
                setFields(fetchedFields);
                initialFormData = fetchedFields.reduce((acc, field) => {


                    Object.keys(field).map((key) => {
                        if (!acc[field.id]) {
                            acc[field.id] = {}
                        }
                       
                            acc[field.id][key] = field[key]
                        
                    })
                    return acc
                }, {});
                
            }
            else {
                fetchedFields = await fetchFormFields();
                setLoadedFromLocal(false)
                setFields(fetchedFields);
                initialFormData = fetchedFields.reduce((acc, field) => {


                    Object.keys(field).map((key) => {
                        if (!acc[field.id]) {
                            acc[field.id] = {}
                        }
                        if (key == 'list') {
                            console.log('field key', field[key])
                            if (!acc[field.id][key]) {
                                acc[field.id][key] = []
                            }
                            field[key].forEach(name => acc[field.id][key].push({ name: name }))
                        }
                        else {
                            acc[field.id][key] = field[key]
                        }
                    })
                    return acc
                }, {});
                

            }



            
            console.log('fetched intake data is ', fetchedFields)
            

            setFormData(initialFormData);
            setRecievedFormData(initialFormData);
            setFormDataInputs(initialFormData)
            setFields(fetchedFields);
            setFormLoad(true);


        };

        loadFields();



    }, []);

    useEffect(() => {
        const total = Object.keys(formData).filter((key) => key.slice(0, -1) == 't').reduce((acc, item) => acc + +formData[item]['cnt'], 0)
        console.log('ob keys', Object.keys(formData).filter((key) => key.slice(0, -1) == 't'))
        const getTotWord = (total) => {
            if (total % 10 === 1 && total % 100 !== 11) {
                return 'литр';
            } else if (total % 10 >= 2 && total % 10 <= 4 && (total % 100 < 12 || total % 100 > 14)) {
                return 'литра';
            } else {
                return 'литров';
            }
        };
        const getTotalMessage = (total) => {

            const totWord = getTotWord(total);

            return `Итого ${total.toLocaleString('ru')} ${totWord}`;

        };
        setTotFuel(getTotalMessage(total));
    }, [formData])

    const handleChangeOperator = (e) => {
        console.log(e)
        const id = e.target.id
        const value = e.target.value
        const key = e.target.name
        console.log(e.target.name)
        setFormData(prevData => ({
            ...prevData,
            [id]: {
                ...prevData[id],
                [key]: value,
            },
        }))

    }



    const handleChangeTemp = (e, d) => {
        console.log('onChange', e.target)
        console.log(formData)
        const id = e.target.id
        const key = e.target.name
        const tValue = (e.target.value).replace(/[^0-9]/g, '')
        console.log('tValue is ', tValue)
        let value
        if (d) {
            value = +(+tValue + +d)
        }
        else {
            value = tValue
        }
        setFormData(prevData => ({
            ...prevData,
            [id]: {
                ...prevData[id],
                [key]: value,
            },
        }))
       
    };



    useEffect(() => {
        
        setfieldsFilled(() => {
            const date = (new Date()).toLocaleDateString();
            localStorage.setItem('tempShiftData', JSON.stringify({ ...formData, date: date }))
            for (let key of Object.keys(formData).filter(key => key != 'cashbox1 sevices' &&
                key != 'cashbox2 sevices' && key != 'operator1' && key != 'operator2'
            )) {
                if (formData[key].cnt == ''
                ) {
                    return false
                }
            }
            return true
        })
        
    }, [formData, formDataInputs]);

    const handleSubmit = () => {
        console.log(formData)
        console.log("tyring to submit resToSubmit values:", formData);
        var date = new Date();
        const updDate = date.getFullYear() + '-' +
            ('00' + (date.getMonth() + 1)).slice(-2) + '-' +
            ('00' + date.getDate()).slice(-2)
        fetch(APIURL + '/send-shiftReport', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...formData, initData: window.Telegram.WebApp.initData, date: updDate })
        })
        localStorage.removeItem('tempShiftData')
        navigate('/', {
            replace: true,
            state: { sent: true }
        });


    }


    console.log('render', formData);
    console.log('is changes exist', isFieldsFilled)
    console.log('load from local? ', loadedFromLocal)
    // console.log('modiefed cal', cal)
    if (formLoad) {
        return (
            <div className={styles.container}>
                <div name={"start"} className={styles.subheader} id={'start'}>Отчёт за смену {(new Date((new Date).getTime() - (24 * 60 * 60 * 1000))).toLocaleDateString()} </div>
                <div className={styles.dataBlock}>
                    <div className={styles.intakeData}
                        name={'start'} >


                        <div className={styles.intakeDataHeader}
                            name={'header'}
                        >Реализация ГСМ</div>


                        {fields.filter((field) => field.category == 'Реализация топлива' && field.id.substring(0,1) == 't').map((field) => {
                            return (

                                <>
                                    <div className={styles.hBefore}>{field.name}</div>
                                    <div className={styles.inputline}>
                                        <input
                                            className={styles.input}
                                            id={field.id}
                                            name={'cnt'}
                                            key={field.id}
                                            value={formData[field.id]['cnt']}
                                            type='text'
                                            inputMode='numeric'
                                            min={0}
                                            maxLength={5}
                                            onChange={handleChangeTemp}
                                        />
                                        <button
                                            className={styles.button}
                                            id={field.id}
                                            name={'cnt'}
                                            tabIndex="-1"
                                            value={formData[field.id]['cnt']} onClick={(e) => handleChangeTemp(e, -1)}>&minus;</button>
                                        <button
                                            className={styles.button}
                                            id={field.id}
                                            name={'cnt'}
                                            tabIndex="-1"
                                            value={formData[field.id]['cnt']} onClick={(e) => handleChangeTemp(e, 1)}>+</button>
                                    </div>
                                </>
                            )
                        })}
                        <div className={styles.awaitH}>{totFuel}</div>
                        <div className={styles.hBefore}>Выручка ГСМ, ₽ </div>
                        <div className={styles.inputline}>
                            <input
                                className={styles.input}
                                id={'proceeds fuel'}
                                name={'cnt'}
                                value={formData['proceeds fuel']['cnt']}
                                type='text'
                                inputMode='numeric'
                                min={0}
                                onChange={handleChangeTemp}
                            />
                            <button
                                className={styles.button}
                                id={'proceeds fuel'}
                                name={'cnt'}
                                tabIndex="-1"
                                value={formData['proceeds fuel']['cnt']} onClick={(e) => handleChangeTemp(e, -1)}>&minus;</button>
                            <button
                                className={styles.button}
                                id={'proceeds fuel'}
                                name={'cnt'}
                                tabIndex="-1"
                                value={formData['proceeds fuel']['cnt']} onClick={(e) => handleChangeTemp(e, 1)}>+</button>
                        </div>
                    </div>
                </div>
                <div className={styles.dataBlock}>
                    <div className={styles.intakeData}
                        name={'start'} >

                        <div className={styles.intakeDataHeader}
                            name={'header'}
                        >Сопутствующие товары</div>

                        {fields.filter((field) => field.category == 'Сопутствующие товары').map((field) => {


                            return (
                                <div>

                                    <div className={styles.hBefore}>{field.name}</div>
                                    <div className={styles.inputline}>
                                        <input
                                            className={styles.input}
                                            id={field.id}
                                            name={'cnt'}
                                            value={formData[field.id]['cnt']}
                                            type='text'
                                            inputMode='numeric'
                                            min={0}
                                            onChange={handleChangeTemp}
                                        />
                                        <button
                                            className={styles.button}
                                            id={field.id}
                                            name={'cnt'}
                                            tabIndex="-1"
                                            value={formData[field.id]['cnt']} onClick={(e) => handleChangeTemp(e, -1)}>&minus;</button>
                                        <button
                                            className={styles.button}
                                            id={field.id}
                                            name={'cnt'}
                                            tabIndex="-1"
                                            value={formData[field.id]['cnt']} onClick={(e) => handleChangeTemp(e, 1)}>+</button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className={styles.dataBlock}>
                    <div className={styles.intakeData}
                        name={'start'} >

                        <div className={styles.intakeDataHeader}
                            name={'header'}
                        >Данные смены</div>

                        {fields.filter((field) => field.id == 'cashbox1 sevices').map((field) => {
                            return (
                                <div>
                                    <div className={styles.hBefore}>{field.name}</div>
                                    <div className={styles.inputline}>
                                        <input
                                            className={styles.input}
                                            id={field.id}
                                            name={'cnt'}
                                            value={formData[field.id]['cnt']}
                                            type='text'
                                            inputMode='numeric'
                                            min={0}
                                            maxLength={5}
                                            onChange={handleChangeTemp}
                                        />
                                        <button
                                            className={styles.button}
                                            id={field.id}
                                            name={'cnt'}
                                            tabIndex="-1"
                                            value={formData[field.id]['cnt']} onClick={(e) => handleChangeTemp(e, -1)}>&minus;</button>
                                        <button
                                            className={styles.button}
                                            id={field.id}
                                            name={'cnt'}
                                            tabIndex="-1"
                                            value={formData[field.id]['cnt']} onClick={(e) => handleChangeTemp(e, 1)}>+</button>
                                    </div>
                                    <div className={styles.hBefore}>Оператор 1</div>
                                    <div >
                                        <select
                                            className={styles.inputline}
                                            id={'operator1'}
                                            name={'cnt'}
                                            value={formData['operator1']['cnt']}
                                            type='text'
                                            // list="tetstlist"
                                            list="options"
                                            // inputMode='search'
                                            onChange={handleChangeOperator}
                                        >
                                            <option value="" selected disabled hidden></option>
                                            {(formData['operator1']['list']).map((option, index) => (

                                                <option key={option.index} value={option.name}>

                                                    {option['name']}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )
                        })}

                        {fields.filter((field) => field.id == 'cashbox2 sevices').map((field) => {
                            return (
                                <div>
                                    <div className={styles.hBefore}>{field.name}</div>
                                    <div className={styles.inputline}>
                                        <input
                                            className={styles.input}
                                            id={field.id}
                                            name={'cnt'}
                                            value={formData[field.id]['cnt']}
                                            type='text'
                                            inputMode='numeric'
                                            min={0}
                                            maxLength={5}
                                            onChange={handleChangeTemp}
                                            defaultValue=''
                                        />
                                        <button
                                            className={styles.button}
                                            id={field.id}
                                            name={'cnt'}
                                            tabIndex="-1"
                                            value={formData[field.id]['cnt']} onClick={(e) => handleChangeTemp(e, -1)}>&minus;</button>
                                        <button
                                            className={styles.button}
                                            id={field.id}
                                            name={'cnt'}
                                            tabIndex="-1"
                                            value={formData[field.id]['cnt']} onClick={(e) => handleChangeTemp(e, 1)}>+</button>
                                    </div>
                                    <div className={styles.hBefore}>Оператор 2</div>
                                    <div >
                                        <select
                                            className={styles.inputline}
                                            id={'operator2'}
                                            name={'cnt'}
                                            value={formData['operator2']['cnt']}
                                            type='text'
                                            list="options"
                                            onChange={handleChangeOperator}
                                        >
                                            <option value="" selected disabled hidden></option>
                                            {(formData['operator2']['list']).map((option, index) => (

                                                <option
                                                    key={option.index} value={option.name}>

                                                    {option['name']}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )
                        })}


                        <div>

                        </div>

                    </div>
                    {(isFieldsFilled && <Button onPress={handleSubmit} className={styles.submit}>Отправить</Button>)}
                </div>

            </div>

        )
    }
    else {
        return (
            <Box className={styles.progress} >
                <CircularProgress variant="plain" />
            </Box>
        )
    }




};

export default ShiftRep;