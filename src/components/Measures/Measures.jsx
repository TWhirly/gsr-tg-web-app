import React, { useCallback, useEffect, useState, useLayoutEffect, useRef, useContext } from 'react';
import styles from './Measures.module.css';
import { localUrl } from '../../localSettings.js'
import 'animate.css';
import { useNavigate, useHistory } from "react-router-dom";
import { NumberField, Label, Group, Input, Button, Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';
import { useLinkProps } from '@react-aria/utils';
import { useTelegram } from "../../hooks/useTelegram";
import { type } from '@testing-library/user-event/dist/type/index.js';
import { Element, Events, animateScroll as scroll, Link } from 'react-scroll';
import { DataContext } from '../../DataContext';



// import { Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';

const APIURL = localUrl.APIURL;



const Measures = () => {
    const navigate = useNavigate();
    const myRef = useRef();

    const fetchFormFields = async () => {
        const response = await fetch(APIURL + '/measures', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ initData: window.Telegram.WebApp.initData })
        }); // Генерируем объект Response
        const jVal = await response.json(); // Парсим тело ответа
        return jVal
    };

    const calibration = async () => {
        const response = await fetch(APIURL + '/calibration', {
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
    const { stationId } = useContext(DataContext);



    useEffect(() => {

        
        console.log(localStorage)

        const loadFields = async () => {
            let fetchedFields
            const storedData = localStorage.getItem(stationId[0][0].ID+'tempMeasuresData');



            if (storedData) {
                setLoadedFromLocal(true)
                const storedDataObj = JSON.parse(storedData);
                // console.log('stored', storedDataObj)
                if (storedDataObj.date !== (new Date()).toLocaleDateString()) {
                    localStorage.removeItem(stationId[0][0].ID+'tempMeasuresData');
                    return
                }
                delete storedDataObj.date
                fetchedFields = [];
                Object.keys(storedDataObj).forEach(key => {
                    storedDataObj[key]['id'] = key
                    fetchedFields.push(storedDataObj[key])
                })
                setIsChangesExist(true)
                // console.log('fetched from stored', fetchedFields)
            }
            else {
                fetchedFields = await fetchFormFields();
                setLoadedFromLocal(false)
            }


            setFields(fetchedFields);
            // console.log('fetched intake data is ', fetchedFields)
            const initialFormData = fetchedFields.reduce((acc, field) => {
                densTempShow.set(field.id, false)
                Object.keys(field).map((key) => {
                    if (!acc[field.id]) {
                        acc[field.id] = {}
                        acc[field.id]['awaitH'] = 0
                        acc[field.id]['vFact'] = 0
                    }
                    if (key !== 'id') {
                        // console.log('key is ', key)
                        if ((key == 'd' || key == 'height') && field[key]) {
                            acc[field.id][key] = field[key].toString().replace('.', ',')
                        }
                        else {
                            acc[field.id][key] = field[key]
                        }
                    }

                })
                return acc;
            }, {});
            setFormData(initialFormData);
            setRecievedFormData(initialFormData);
            setFormDataInputs(initialFormData)
            setFields(fetchedFields);
            setFormLoad(true);


        };

        const loadCalibration = async () => {
            const fetchedCalFields = await calibration();
            setFieldsCal(fetchedCalFields)


            let i
            const initialCalibration = fetchedCalFields.reduce((acc, field) => {

                if (!acc[field.tank]) {
                    i = 0
                    acc[field.tank] = {}
                }
                i++
                acc[field.tank][field.h] = field.v
                acc[field.tank]['maxH'] = i - 1
                return acc;
            }, {});
            setCal(initialCalibration)


            setCalibLoad(true)
        }

        loadCalibration();
        loadFields();



    }, []);

    useEffect(() => {
        if (calibLoad && formLoad) {

            fields.map((field) => {
                if (field.repRem) {
                    const id = field.id
                    const value = field.repRem
                    // console.log('id & value', id, value)
                    setFormData(prevData => ({
                        ...prevData,
                        [id]: {
                            ...prevData[id],
                            awaitH: calcAwaitH(id, value),

                        },
                    }));
                    setFormDataInputs(prevData => ({
                        ...prevData,
                        [id]: {
                            ...prevData[id],
                            awaitH: calcAwaitH(id, value),

                        },
                    }));
                }
                if (field.height) {
                    const id = field.id
                    const value = field.height
                    // console.log('id & value', id, value)
                    setFormData(prevData => ({
                        ...prevData,
                        [id]: {
                            ...prevData[id],
                            vFact: calcVolume(id, value),

                        },
                    }));
                    setFormDataInputs(prevData => ({
                        ...prevData,
                        [id]: {
                            ...prevData[id],
                            vFact: calcVolume(id, value),

                        },
                    }));
                }
            })
        }
    }, [calibLoad, formLoad, fields])

    useEffect(() => {
        setDensTempshow(densTempShow)
    }, [densTempShow, toggleState])

    const calcVolume = (id, height) => {
        // console.log('hheigth ', height)
        let h = +(height.toString().replace(',', '.'))
        let tank = formData[id]['Tank'];
        let volume
        // console.log('h is ', h, 'tank is ', tank, 'id is ', id)
        if (+h > 1) {
            // console.log(cal[tank][Math.trunc(h)])
            volume = (cal[tank][Math.trunc(h)] -
                (cal[tank][Math.trunc(h) - 1] ? cal[tank][Math.trunc(h) - 1] : cal[tank][Math.trunc(h)]))
                * (h - Math.trunc(h)) +
                cal[tank][Math.trunc(h)];
        }
        else {
            volume = 0;
        }
        return Math.round(volume)
    }

    const calcAwaitH = (id, repRem) => {
        // console.log('calc')
        let volume
        let height
        let cap = +formData[id]['yesterday_capitalization']
        let imbalance = +formData[id]['yesterday_imbalance']
        let tank = formData[id]['Tank'];


        // cal[tank][Math.trunc(h) - 1]
        // console.log('imbalance is ', imbalance, 'cap is ', cap, 'tank is ', tank, 'repRem is ', repRem)
        const awaitVol = +repRem - +cap + +imbalance
        // console.log('max V is ', Math.max(...Object.values(cal[tank])))
        if (awaitVol < Math.max(...Object.values(cal[tank]))) {
            for (let i = 0; i < Object.entries(cal[tank]).length; ++i) {
                if (cal[tank][i] > awaitVol) {
                    height = [[i - 1, cal[tank][i - 1]], [i, cal[tank][i]]]
                    break
                }
            }
            // console.log('calculated height is ', height)
            return ((Math.ceil((((awaitVol - height[0][1]) / ((height[1][1] - height[0][1]))) + +height[0][0]) * 10)) / 10)
        }

        else {
            return (NaN)
        }
    }



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
            // console.log('key is d started')
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

    const handleBlurD = (e) => {
        const id = e.target.id
        const key = e.target.name
        const tValue = e.target.value
        const oldValue = recievedFormData[id][key]
        // console.log('old dens ', oldValue)
        let value
        if (tValue.length == 2) {
            value = oldValue
        }
        if (tValue.length == 3) {
            value = tValue + '00'
        }
        if (tValue.length == 4) {
            value = tValue + '0'
        }
        if (tValue.length == 5) {
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

    const handleBlurH = (e) => {
        const id = e.target.id
        const key = e.target.name
        const tValue = e.target.value
        console.log('tValue', tValue)
        const oldValue = recievedFormData[id][key]
        let value


        if (!tValue.includes(',') && tValue.length > 0) {
            value = tValue + ',0'
        }

        if (tValue.length === 0) {
            console.log('9')
            value = oldValue
        }

        if (tValue.includes(',') && tValue.length > 0) {
            console.log('hm')
            value = tValue
        }
        // console.log('vv is', value)
        setFormData(prevData => ({
            ...prevData,
            [id]: {
                ...prevData[id],
                [key]: value,
            },
        }))

    }


    const handleChange = (e, d) => {
        // console.log('onChange', e.target)
        // console.log(formData)
        const id = e.target.id
        const key = e.target.name
        let tValue = e.target.value.replace(/[^\d.,]/g, '').replace(',', '.');
        tValue.length == 0 ? tValue = '' : tValue
        if (isNaN(+tValue)) {
            // console.log('isNaN', tValue.length)
            tValue = tValue.substring(0, tValue.length - 1)
        }
        var value
        if (d) {
            value = (parseFloat(+tValue) + (d ? +d : 0)).toFixed(1).replace('.', ',')
        }
        else {
            if (tValue.includes('.') && parseFloat(tValue) % 10 != 0)
                value = tValue.replace('.', ',')
            else {
                value = tValue
            }
        }
        if ([key] == 'height') {
            setFormData(prevData => ({
                ...prevData,
                [id]: {
                    ...prevData[id],
                    [key]: value,
                    vFact: calcVolume(id, value),
                },
            }))
        }
        else {
            setFormData(prevData => ({
                ...prevData,
                [id]: {
                    ...prevData[id],
                    [key]: value,
                },
            }))
        }

    };

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
        if ([key] == 'repRem') {
            setFormData(prevData => ({
                ...prevData,
                [id]: {
                    ...prevData[id],
                    [key]: value,
                    awaitH: calcAwaitH(id, value),
                },
            }))
        }

        else {
            setFormData(prevData => ({
                ...prevData,
                [id]: {
                    ...prevData[id],
                    [key]: value,
                },
            }))

        };

    };

    const handleChangeDens = (e, d) => {
        // console.log('onChange', e.target)
        // console.log('value length is ', (e.target.value).length)
        const id = e.target.id
        const key = e.target.name
        let tValue
        if (e.target.value == '') {
            tValue = '0'
        }
        else {
            tValue = e.target.value.replace(/[^\d.,]/g, '').replace('.', ',')
        }
        let value
        // console.log('tValue', tValue)
        if (isNaN(tValue.replace(',', '.'))) {
            console.log('isNaN')
            tValue = tValue.substring(0, tValue.length - 1)
        }
        if (tValue.length == 1 && tValue.substring(0, 1) != 0) {
            tValue = '0,' + tValue
        }
        if (tValue.length == 2 && tValue.substring(0, 2) != '0,') {
            tValue = '0,' + tValue.substring(2, 1)
        }
        if (tValue.length >= 3 && tValue.substring(0, 2) != '0,') {
            tValue = '0,'
        }

        if (d) {
            // console.log('parse', tValue.replace(',', '.'))
            if (!tValue) {
                tValue = '0'
            }
            value = ((parseFloat(tValue.replace(',', '.'))) + (d ? +d : 0)).toFixed(3).replace('.', ',')
            // value = (+(e.target.value) + (d ? +d : 0)).toFixed(3)
        }


        else {
            value = tValue
        }


        setFormData(prevData => ({
            ...prevData,
            [id]: {
                ...prevData[id],
                [key]: value
            },
        }));

    };

    useEffect(() => {
        setfieldsFilled(() => {
            for (let key of Object.keys(formData)) {
                if (formData[key].d == null ||
                    formData[key].t == null ||
                    formData[key].height == null ||
                    formData[key].repRem == null ||
                    formData[key].d == '' ||
                    formData[key].t == '' ||
                    formData[key].height == '' ||
                    formData[key].repRem == '') {
                    return false
                }
            }
            return true
        })
    }, [formData, formDataInputs]);

    useEffect(() => {
        var loaded = []
        var current = []
        // console.log('formData in check', formData)
        // console.log('formDataInputs in check', formDataInputs)
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
            localStorage.setItem(stationId[0][0].ID+'tempMeasuresData', JSON.stringify({ ...formData, date: date }))
            setIsChangesExist(true)
            return
        }
                else {
            setIsChangesExist(false)
        }
        if(loadedFromLocal){
            setIsChangesExist(true)
        }

    }, [formData, formDataInputs]);

    const handleSubmit = () => {
        console.log(formData)
        console.log("tyring to submit resToSubmit values:", formData);
        fetch(APIURL + '/send-measures', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...formData, initData: window.Telegram.WebApp.initData })
        })
        localStorage.removeItem(stationId[0][0].ID+'tempMeasuresData')
        navigate('/', {
            replace: true,
            state: { sent: true }
        });


    }
    console.log('render', formData);
    console.log('is changes exist', haveChanges)
    console.log('load from local? ', loadedFromLocal)
    console.log('station ID', stationId[0][0].ID)
    // console.log('modiefed cal', cal)

    if (calibLoad && formLoad) {


        return (
            <div className={styles.container}>
                <Element name={"start"} className={styles.subheader} id={'start'}>Замеры НП сегодня, {(new Date).toLocaleDateString()} </Element>
                <div className={styles.intakesContainer}>{fields.map((field) => {
                    return (
                        <div className={styles.intakeBlock} key={field.id}>
                            <div className={styles.intakeData}>


                                <div className={styles.fueltype}>{field.tankFuel} </div>


                            </div>
                            <div className={styles.measuresData}>
                                <div className={styles.hBefore}>Расчетный остаток по сменному отчёту</div>
                                <div className={styles.inputline}>
                                    <input
                                        className={styles.input}
                                        id={field.id}
                                        name='repRem'
                                        value={formData[field.id]['repRem']}
                                        type='text'
                                        inputMode='numeric'
                                        min={0}
                                        maxLength={5}
                                        onChange={handleChangeTemp}
                                        onFocus={clearOnFocus}
                                        onBlur={handleBlurT} />
                                    <button
                                        className={styles.button}
                                        id={field.id}
                                        name='repRem'
                                        tabIndex="-1"
                                        value={formData[field.id]['repRem']} onClick={(e) => handleChangeTemp(e, -1)}>&minus;</button>
                                    <button
                                        className={styles.button}
                                        id={field.id}
                                        name='repRem'
                                        tabIndex="-1"
                                        value={formData[field.id]['repRem']} onClick={(e) => handleChangeTemp(e, 1)}>+</button>
                                </div>

                                <div className={`${styles.awaitH} + ${(formData[field.id]['awaitH'] ? '' : styles.Overflow)}`}>
                                    {formData[field.id]['repRem'] > 100 && formData[field.id]['hint'] == 1 ?
                                        (formData[field.id]['awaitH'] ?
                                            'Ожидаемый уровень: ' + (formData[field.id]['awaitH']).toFixed(1).replace('.', ',') :
                                            "Некорректные данные") : ''}</div>

                                <div className={styles.hBefore}>Уровень, см</div>
                                <div className={styles.inputline}>


                                    <input
                                        className={styles.input}
                                        id={field.id}
                                        name='height'
                                        value={formData[field.id]['height']}
                                        max={cal[field.Tank]['maxH']}
                                        type='text'
                                        inputMode='decimal'
                                        min={0}
                                        onChange={handleChange}
                                        maxLength={5}
                                        onFocus={clearOnFocus}
                                        onBlur={handleBlurH} />
                                    <button className={styles.button}
                                        id={field.id}
                                        name='height'
                                        tabIndex="-1"
                                        value={formData[field.id]['height']} onClick={(e) => handleChange(e, -0.1)}>&minus;</button>
                                    <button className={styles.button}
                                        id={field.id}
                                        name='height'
                                        tabIndex="-1"
                                        value={formData[field.id]['height']} onClick={(e) => handleChange(e, 0.1)}>+</button>
                                </div>



                                <div className={styles.waybill}>Плотность:</div>
                                <div className={styles.inputline}>
                                    <input
                                        className={styles.input}
                                        id={field.id}
                                        name='d'
                                        value={formData[field.id]['d']}
                                        type='text'
                                        inputMode='numeric'
                                        maxLength={5}
                                        onChange={handleChangeDens}
                                        onFocus={clearOnFocus}
                                        onBlur={handleBlurD} />
                                    <button
                                        className={styles.button}
                                        id={field.id}
                                        name='d'
                                        tabIndex="-1"
                                        value={formData[field.id]['d']} onClick={(e) => handleChangeDens(e, -0.001)}>&minus;</button>
                                    <button
                                        className={styles.button}
                                        id={field.id}
                                        name='d'
                                        tabIndex="-1"
                                        value={formData[field.id]['d']} onClick={(e) => handleChangeDens(e, 0.001)}>+</button>
                                </div>
                                <div className={styles.waybill}>Температура:</div>
                                <div className={styles.inputline}>
                                    <input
                                        className={styles.input}
                                        id={field.id}
                                        name='t'
                                        value={formData[field.id]['t']}
                                        type='text'
                                        inputMode='numeric'
                                        min={-40}
                                        max={40}
                                        maxLength={2}
                                        onFocus={clearOnFocus}
                                        onChange={handleChangeTemp}
                                        onBlur={handleBlurT} />
                                    <button
                                        className={styles.button}
                                        id={field.id}
                                        name='t'
                                        tabIndex="-1"
                                        value={formData[field.id]['t']} onClick={(e) => handleChangeTemp(e, -1)}>&minus;</button>
                                    <button
                                        className={styles.button}
                                        id={field.id}
                                        name='t'
                                        tabIndex="-1"
                                        value={formData[field.id]['t']} onClick={(e) => handleChangeTemp(e, 1)}>+</button>
                                </div>
                            </div>
                        </div>


                    )
                })}


                </div>
                {(isFieldsFilled && haveChanges &&<Button onPress={handleSubmit} className={styles.submit}>Отправить</Button>)}
            </div>


        )
    }



};

export default Measures;