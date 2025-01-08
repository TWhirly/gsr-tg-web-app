import React, { useCallback, useEffect, useState, useLayoutEffect, useRef } from 'react';
import styles from './ShiftRep.module.css';
import { localUrl } from '../../localSettings.js'
import 'animate.css';
import { useNavigate, useHistory } from "react-router-dom";
import { NumberField, Label, Group, Input, Button, Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';
import { useLinkProps } from '@react-aria/utils';
import { useTelegram } from "../../hooks/useTelegram";
import { type } from '@testing-library/user-event/dist/type/index.js';
import { Element, Events, animateScroll as scroll, Link } from 'react-scroll';

// import { Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';

const APIURL = localUrl.APIURL;



const Measures = () => {
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


            setFields(fetchedFields);
            console.log('fetched intake data is ', fetchedFields)
            const initialFormData = fetchedFields.reduce((acc, field) => {
                acc[field.id] = '';

                return acc;
            }, {});

            setFormData(initialFormData);
            setRecievedFormData(initialFormData);
            setFormDataInputs(initialFormData)
            setFields(fetchedFields);
            setFormLoad(true);


        };

        loadFields();



    }, []);


    const clearOnFocus = (e) => {
        setRecievedFormData(prevData => ({
            ...prevData,
            [id]: {
                ...prevData[id],
                [key]: value,
            },
        }))
        const id = e.target.id
        const key = e.target.name
        const value = e.target.value
        if (key.substring(0, 1) == 'd') {
            console.log('key is d started')
            setFormData(prevData => ({
                ...prevData,
                [id]: {
                    ...prevData[id],
                    [key]: "0,",
                },
            }))
            setFormDataInputs(prevData => ({
                ...prevData,
                [id]: {
                    ...prevData[id],
                    [key]: "0,",
                },
            }))
        }
        else {
            setFormData(prevData => ({
                ...prevData,
                [id]: {
                    ...prevData[id],
                    [key]: "",
                },
            }))
            setFormDataInputs(prevData => ({
                ...prevData,
                [id]: {
                    ...prevData[id],
                    [key]: "",
                },
            }))
        }
    }



    const handleBlurT = (e) => {
        const id = e.target.id
        const key = e.target.name
        const tValue = e.target.value
        const oldValue = recievedFormData[id][key]
        let value
        if (tValue.length == 0) {
            value = oldValue
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


    }


    const handleChangeTemp = (e, d) => {
        // console.log('onChange', e.target)
        // console.log(formData)
        const id = e.target.id
        const key = e.target.name
        let tValue
        if (key == 't') {
            tValue = e.target.value.toString().replace(/[^\d-]/g, '').replace('.', '').replace(',', '')
        }
        else {

            tValue = e.target.value.toString().replace(/[^\d]/g, '').replace('.', '').replace(',', '')
        }
        if (isNaN(tValue)) {
            tValue = tValue.substring(0, tValue.length - 1)
        }
        var value
        if (d) {

            value = +(+tValue + +d)
        }
        else {

            value = tValue

        }
       
            setFormData(prevData => ({
                ...prevData,
                [id]: value,
                
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

    useEffect(() => {
        var loaded = []
        var current = []
        console.log('formData in check', formData)
        console.log('formDataInputs in check', formDataInputs)
        Object.keys(formData).forEach(key => {
            Object.keys(formData[key]).forEach(key2 => {
                if ((key2 == 'd' || key2 == 'height' || key2 == 't' || key2 == 'repRem') && formData[key][key2]) {
                    current.push(formData[key][key2])
                    loaded.push(formDataInputs[key][key2])
                }
            })
        })
        if (current.join(' ') !== loaded.join(' ')) {
            const date = (new Date()).toLocaleDateString();
            localStorage.setItem('tempMeasuresData', JSON.stringify({ ...formData, date: date }))
            setIsChangesExist(true)
            return
        }
        else {
            setIsChangesExist(false)
        }
        if (loadedFromLocal) {
            setIsChangesExist(true)
        }

    }, [formData, formDataInputs]);

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
    console.log('render', formData);
    console.log('is changes exist', haveChanges)
    console.log('load from local? ', loadedFromLocal)
    // console.log('modiefed cal', cal)

    return (
        <div className={styles.container}>
            <Element name={"start"} className={styles.subheader} id={'start'}>Отчёт за смену {(new Date((new Date).getTime() - (24 * 60 * 60 * 1000))).toLocaleDateString()} </Element>
            <div >{fields.filter((field) => field.id != 'cashbox2').map((field) => {
                return (
                    
                        
                        <div >
                            <div className={styles.hBefore}>{field.name}</div>
                            <div className={styles.inputline}>
                                <input
                                    className={styles.input}
                                    id={field.id}
                                    name={field}
                                    value={formData[field.id]}
                                    type='text'
                                    inputMode='numeric'
                                    min={0}
                                    maxLength={5}
                                    onChange={handleChangeTemp}
                                    // onFocus={clearOnFocus}
                                    onBlur={handleBlurT} />
                                <button
                                    className={styles.button}
                                    id={field.id}
                                    name={field}
                                    tabIndex="-1"
                                    value={formData[field.id]} onClick={(e) => handleChangeTemp(e, -1)}>&minus;</button>
                                <button
                                    className={styles.button}
                                    id={field.id}
                                    name={field}
                                    tabIndex="-1"
                                    value={formData[field.id]} onClick={(e) => handleChangeTemp(e, 1)}>+</button>
                            </div>
                        </div>
                    


                )
            })}


            </div>
            {(isFieldsFilled && haveChanges && <Button onPress={handleSubmit} className={styles.submit}>Отправить</Button>)}
        </div>


    )




};

export default Measures;