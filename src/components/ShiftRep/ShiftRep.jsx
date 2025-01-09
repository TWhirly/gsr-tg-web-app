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
    // localStorage.removeItem('tempMeasuresData')
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
            const storedData = localStorage.getItem('tempShiftReportData');



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
            }
            else {
                fetchedFields = await fetchFormFields();
                setLoadedFromLocal(false)
            }


            // fetchedFields.push({id: 'proceeds fuel', name: 'Выручка ГСМ:', category: 'Реализация топлива', cnt: ''})

            setFields(fetchedFields);
            console.log('fetched intake data is ', fetchedFields)
            const initialFormData = fetchedFields.reduce((acc, field) => {


                Object.keys(field).map((key) => {
                    if (!acc[field.id]) {
                        acc[field.id] = {}
                    }
                    acc[field.id][key] = field[key]
                })
                return acc
            }, {});
            initialFormData['proceeds fuel'] = { cnt: '' }

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





    const handleChangeTemp = (e, d) => {
        console.log('onChange', e.target)
        console.log(formData)
        const id = e.target.id
        const key = e.target.name
        const tValue = e.target.value
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
            for (let key of Object.keys(formData)) {
                if (formData[key].d == null ||
                    formData[key].t == null ||
                    formData[key].height == null ||
                    formData[key].repRem == null) {
                    return false
                }
            }
            return true
        })
    }, [formData, formDataInputs]);

    // useEffect(() => {
    //     var loaded = []
    //     var current = []
    //     console.log('formData in check', formData)
    //     console.log('formDataInputs in check', formDataInputs)
    //     Object.keys(formData).forEach(key => {
    //         Object.keys(formData[key]).forEach(key2 => {
    //             if ((key2 == 'd' || key2 == 'height' || key2 == 't' || key2 == 'repRem') && formData[key][key2]) {
    //                 current.push(formData[key][key2])
    //                 loaded.push(formDataInputs[key][key2])
    //             }
    //         })
    //     })
    //     if (current.join(' ') !== loaded.join(' ')) {
    //         const date = (new Date()).toLocaleDateString();
    //         localStorage.setItem('tempMeasuresData', JSON.stringify({ ...formData, date: date }))
    //         setIsChangesExist(true)
    //         return
    //     }
    //     else {
    //         setIsChangesExist(false)
    //     }
    //     if (loadedFromLocal) {
    //         setIsChangesExist(true)
    //     }

    // }, [formData, formDataInputs]);

    const handleSubmit = () => {
        console.log(formData)
        console.log("tyring to submit resToSubmit values:", formData);
        fetch(APIURL + '/send-shiftReport', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...formData, initData: window.Telegram.WebApp.initData })
        })
        localStorage.removeItem('tempMeasuresData')
        navigate('/', {
            replace: true,
            state: { sent: true }
        });


    }
    const tetstlist = ['d1', 't2', 'y33']
    const options = [
        'Option 1',
        'Option 2',
        'Option 3',
    ];

    console.log('render', formData);
    console.log('fields', formData.operator1)
    console.log('is changes exist', haveChanges)
    console.log('load from local? ', loadedFromLocal)
    // console.log('modiefed cal', cal)
    if (formLoad) {
        return (
            <div className={styles.container}>
                <Element name={"start"} className={styles.subheader} id={'start'}>Отчёт за смену {(new Date((new Date).getTime() - (24 * 60 * 60 * 1000))).toLocaleDateString()} </Element>
                <div className={styles.intakeData}
                    name={'start'} >

                    <div className={styles.intakeDataHeader}
                        name={'header'}
                    >Реализация ГСМ</div>

                    {fields.filter((field) => field.category == 'Реализация топлива').map((field) => {


                        return (
                            <div>

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
                            </div>
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
                            </div>
                        )
                    })}
                </div>

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
                            </div>
                        )
                    })}


                    <div>

                        <div className={styles.hBefore}>Оператор 1</div>
                        <div className={styles.inputline}>
                            <select
                                className={styles.input}
                                id={'options'}
                                name={'cnt'}
                                value={formData['operator1']['cnt']}
                                type='text'
                                // list="tetstlist"
                                list="options"
                                // inputMode='search'
                                onChange={handleChangeTemp}
                            >
                        
                                {(formData['operator1']['list']).map((option, index) => (
                              
                                    <option key={formData['operator1']['list']} value={formData['operator1']['list']} />
                                ))}
                            
                            </select>

                        </div>
                    </div>


                </div>








                {(isFieldsFilled && haveChanges && <Button onPress={handleSubmit} className={styles.submit}>Отправить</Button>)}
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