import React, { useCallback, useEffect, useState, useLayoutEffect, useRef } from 'react';
import styles from './fuelIntake.module.css';
import { localUrl } from '../../localSettings.js'
import 'animate.css';
import { useNavigate, useHistory } from "react-router-dom";
import { NumberField, Label, Group, Input, Button, Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';
import { useLinkProps } from '@react-aria/utils';
import { useTelegram } from "../../hooks/useTelegram";
import { type } from '@testing-library/user-event/dist/type/index.js';


// import { Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';

const APIURL = localUrl.APIURL;



const FuelIntake = () => {
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const nextInputRef = useRef(null);

    const fetchFormFields = async () => {
        const response = await fetch(APIURL + '/fuelIntake', {
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
    const [allFieldsFilled, setIsFormComplete] = useState(false);
    const [calibLoad, setCalibLoad] = useState(false)
    const [formLoad, setFormLoad] = useState(false)
    const [densTempShow, setDensTempshow] = useState(new Map())
    const [toggleState, setToggleState] = useState(false);



    useEffect(() => {



        const loadFields = async () => {
            const fetchedFields = await fetchFormFields();
            setFields(fetchedFields);
            console.log('fetched intake data is ', fetchedFields)
            const initialFormData = fetchedFields.reduce((acc, field) => {
                densTempShow.set(field.id, false)
                Object.keys(field).map((key) => {
                    if (!acc[field.id]) {
                        acc[field.id] = {}
                        acc[field.id]['awaitH'] = 0
                    }
                    if (key !== 'id') {
                        if(key == 'dTruck' || key == 'dBefore' || key == 'dAfter'){
                            acc[field.id][key] = field[key].toString().replace('.',',')
                        }
                        else{
                        acc[field.id][key] = field[key]
                        }
                    }

                })
                return acc;
            }, {});
            setFormData(initialFormData);
            setRecievedFormData(initialFormData);
            setFields(fetchedFields);
            setFormLoad(true);


        };

        const loadCalibration = async () => {
            const fetchedCalFields = await calibration();
            setFieldsCal(fetchedCalFields)
            console.log('fetched cal', fetchedCalFields)
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



        console.log('exit useEffect')
    }, []);

    useEffect(() => {
        if (calibLoad && formLoad) {

            fields.map((field) => {
                const id = field.id
                const value = field.hBefore
                console.log('id & value', id, value)
                setFormData(prevData => ({
                    ...prevData,
                    [id]: {
                        ...prevData[id],
                        awaitH: calcAwaitH(value, id),
                    },
                }));
            })
        }
    }, [calibLoad, formLoad, fields])

    useEffect(() => {
       setDensTempshow(densTempShow)
    }, [densTempShow, toggleState])

    const calcAwaitH = (h, id, tank, waybill) => {
        // console.log('calc')
        let volume
        let height
        if (!tank) {
            tank = formData[id]['tank'];
        }
        if (!waybill) {
            waybill = +formData[id]['waybill']
        }
        if (+h > 1) {
            volume = (cal[tank][Math.trunc(h)] -
                (cal[tank][Math.trunc(h) - 1] ? cal[tank][Math.trunc(h) - 1] : cal[tank][Math.trunc(h)]))
                * (h - Math.trunc(h)) +
                cal[tank][Math.trunc(h)];
        }
        else {
            volume = 0;
        }
        // cal[tank][Math.trunc(h) - 1]
        // console.log('vol is ', volume)
        const awaitVol = +volume + waybill
        // console.log('await vol is ', awaitVol)
        // console.log('max V is ', Math.max(...Object.values(cal[tank])))
        if (awaitVol < Math.max(...Object.values(cal[tank]))) {
            for (let i = 0; i < Object.entries(cal[tank]).length; i++) {
                if (Object.entries(cal[tank])[i][1] > awaitVol) {
                    height = [Object.entries(cal[tank])[i - 1], Object.entries(cal[tank])[i]]
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

    const hadleClickDensTempShow = (e) => {
        const id = e.target.id
        console.log('DTshow', e.target)
        setToggleState(toggleState == true ? false : true)
       
        if(densTempShow.get(id)){
            densTempShow.set(id, false)
        }
        else{
            densTempShow.set(id, true)
        }
    }

    const clearOnFocus = (e) => {
        const id = e.target.id
        const key = e.target.name
        if(key.substring(0,1) == 'd'){
            console.log('key is d started')
            setFormData(prevData => ({
                ...prevData,
                [id]: {
                    ...prevData[id],
                    [key]: "0,",
                },
            })) 
        }
        else{
        setFormData(prevData => ({
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
    let value
    if(tValue.length == 2){
        value = ''
    }
    if(tValue.length == 3){
        value = tValue + '00'
    }
    if(tValue.length == 4){
        value = tValue + '0'
    }
    if(tValue.length == 5) {
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
    let value
    if (!tValue.includes(',') && tValue.length > 0){
        value = tValue + ',0'
    }
    else{
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


    const handleChange = (e, d) => {
        console.log('onChange', e.target)
        console.log(formData)
        const id = e.target.id
        const key = e.target.name
        let tValue = e.target.value.replace(/[^\d.,]/g, '').replace(',', '.');
        tValue.length == 0 ? tValue = '' : tValue
        if(isNaN(+tValue)){
            console.log('isNaN', tValue.length)
            tValue = tValue.substring(0, tValue.length - 1)
        }
        var value
        if (d) {
            value = (parseFloat(+tValue) + (d ? +d : 0)).toFixed(1).replace('.', ',')
        }
        else {
            if(tValue.includes('.') && parseFloat(tValue) % 10 != 0)
           value = tValue.replace('.', ',')
        else{
            value = tValue 
        }
        }
        if ([key] == 'hBefore') {
            setFormData(prevData => ({
                ...prevData,
                [id]: {
                    ...prevData[id],
                    [key]: value,
                    awaitH: calcAwaitH(tValue, id),
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

    const handleChangeTemp = (e, d) => {
        console.log('onChange', e.target)
        console.log(formData)
        const id = e.target.id
        const key = e.target.name
        let tValue = e.target.value.toString().replace(/[^\d]/g, '').replace('.','').replace(',','')
        if(isNaN(tValue)){
            tValue = tValue.substring(0, tValue.length - 1)
        }
        var value
        if (d) {

            value = +(+tValue + +d)
        }
        else{
           
            value = tValue
            
        }
        setFormData(prevData => ({
            ...prevData,
            [id]: {
                ...prevData[id],
                [key]: value,
            },
        }));


    };

    const handleChangeDens = (e, d) => {
        console.log('onChange', e.target)
        console.log('value length is ', (e.target.value).length)
        const id = e.target.id
        const key = e.target.name
        let tValue = e.target.value.replace(/[^\d.,]/g, '').replace('.',',')
        let value
        if(isNaN(tValue.replace(',','.')) ){
            tValue = tValue.substring(0, tValue.length - 1)
        }
if (tValue.length == 1 && tValue.substring(0,1) != 0){
    tValue = '0,' + tValue
}
if (tValue.length == 2 && tValue.substring(0,2) != '0,'){
    tValue = '0,' + tValue.substring(2,1)
}

        if (d) {
            console.log('parse', tValue.replace(',','.'))
            value = ((parseFloat(tValue.replace(',','.'))) + (d ? +d : 0)).toFixed(3).replace('.',',')
            // value = (+(e.target.value) + (d ? +d : 0)).toFixed(3)
        }

        
          else{
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
        // Проверяем, заполнены ли все поля формы
        const allFieldsFilled = fields.every(field => (formDataInputs[field.id])) && Object.keys(formData).length > 0;

        allFieldsFilled && setIsFormComplete(allFieldsFilled);
    }, [formDataInputs, fields]);

    const handleSubmit = () => {
        console.log(allFieldsFilled);
        console.log(formData)
        console.log("tyring to submit resToSubmit values:", formData);
        fetch(APIURL + '/send-res', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...formData, initData: window.Telegram.WebApp.initData })
        })
        //    navigate('/')
        navigate('/', {
            replace: true,
            state: { sent: true }
        });


    }
    console.log('render', formData);
    console.log('show', densTempShow)
    if (calibLoad && formLoad) {


        return (
            <div className={styles.container}>
                <div className={styles.subheader}>Поступления НП сегодня, {(new Date).toLocaleDateString()}</div>
                <div className={styles.intakesContainer}>{fields.map((field) => {
                    return (
                        <div className={styles.intakeBlock} key={field.id}>
                            <div className={styles.fueltype}>{field.fuel !== 'ДТ' ? 'АИ-' + field.fuel : field.fuel} </div>
                            <div className={styles.tank}>Резервуар № {field.tank}</div>
                            <div className={styles.driver}>Водитель: {field.driver}</div>
                            <div className={styles.plates}>Г/Н автомобиля/прицепа: {field.plates} </div>
                            <div className={styles.sections}>Секции: {field.sections}</div>
                            <div className={styles.waybill}>Объем по накладной: {field.waybill}</div>
                            <div className={styles.hBefore}>Уровень до слива, см</div>
                            <div className={styles.inputline}>


                                <input
                                    className={styles.input}
                                    id={field.id}
                                    name='hBefore'
                                    value={formData[field.id]['hBefore'].replace('.', ',')}
                                    max={cal[field.tank]['maxH']}
                                    type='text'
                                    inputMode='numeric'
                                    min={0}
                                    onChange={handleChange}
                                    maxLength={5}
                                    onFocus={clearOnFocus}
                                    onBlur={handleBlurH}
                                />
                                <button className={styles.button}
                                    id={field.id}
                                    name='hBefore'
                                    tabIndex="-1"
                                    value={formData[field.id]['hBefore']} onClick={(e) => handleChange(e, -0.1)}>&minus;</button>
                                <button className={styles.button}
                                    id={field.id}
                                    name='hBefore'
                                    tabIndex="-1"
                                    value={formData[field.id]['hBefore']} onClick={(e) => handleChange(e, 0.1)}>+</button>
                            </div>
                            <div >
                                <div>Уровень после слива, см</div>
                                <div className={styles.inputline}>
                                    <input
                                        className={styles.input}
                                        id={field.id}
                                        name='hAfter'
                                        value={formData[field.id]['hAfter'].replace('.', ',')}
                                        type='text'
                                        inputMode='numeric'
                                        min={0}
                                        max={cal[field.tank]['maxH']}
                                        maxLength={5}
                                        onChange={handleChange}
                                        onFocus={clearOnFocus}
                                        onBlur={handleBlurH}
                                    />
                                    <button
                                        className={styles.button}
                                        id={field.id}
                                        name='hAfter'
                                        tabIndex="-1"
                                        value={formData[field.id]['hAfter']} onClick={(e) => handleChange(e, -0.1)}>&minus;</button>
                                    <button
                                        className={styles.button}
                                        id={field.id}
                                        name='hAfter'
                                        tabIndex="-1"
                                        value={formData[field.id]['hAfter']} onClick={(e) => handleChange(e, 0.1)}>+</button>
                                </div>
                            </div>
                            <div>{formData[field.id]['awaitH'] ? 'Ожидаемый уровень: ' + (formData[field.id]['awaitH']).toFixed(1).replace('.', ',') :
                                "Превышена вместимость!"}</div>
                                 <div
                                 className={styles.DensTempDataHeader}
                                 id={field.id}
                                 onClick={hadleClickDensTempShow} >
                                    Плотность и температура
                                </div>
                            <div 
                            id={field.id}
                            className={`${styles.densTempBlock} + ${(!densTempShow.get(field.id) ? styles.Hide : '')}`}>
                               
                                <div ></div>
                                <div className={styles.farmDataHeader}>
                                
                                    {'По данным нефтебазы: '+formData[field.id]['dFarm'].toString().replace('.', ',')} {(formData[field.id]['tFarm'] > 0 ? '+' + formData[field.id]['tFarm'] :
                                        formData[field.id]['tFarm']) + '°'}</div>
                                <div>
                                    <div>В АЦ:</div>
                                    <div className={styles.inputline}>
                                        <input
                                            className={styles.input}
                                            id={field.id}
                                            name='dTruck'
                                            value={formData[field.id]['dTruck']}
                                            type='text'
                                            inputMode='numeric'
                                            maxLength={5}
                                            onChange={handleChangeDens}
                                            onFocus={clearOnFocus}
                                            onBlur={handleBlurD}
                                        />
                                        <button
                                            className={styles.button}
                                            id={field.id}
                                            name='dTruck'
                                            tabIndex="-1"
                                            value={formData[field.id]['dTruck']} onClick={(e) => handleChangeDens(e, -0.001)}>&minus;</button>
                                        <button
                                            className={styles.button}
                                            id={field.id}
                                            name='dTruck'
                                            tabIndex="-1"
                                            value={formData[field.id]['dTruck']} onClick={(e) => handleChangeDens(e, 0.001)}>+</button>
                                    </div>
                                    <div className={styles.inputline}>
                                        <input
                                            className={styles.input}
                                            id={field.id}
                                            name='tTruck'
                                            value={formData[field.id]['tTruck']}
                                            type='text'
                                            inputMode='numeric'
                                            min={-40}
                                            max={40}
                                            maxLength={2}
                                            onFocus={clearOnFocus}
                                            onChange={handleChangeTemp}
                                        />
                                        <button
                                            className={styles.button}
                                            id={field.id}
                                            name='tTruck'
                                            tabIndex="-1"
                                            value={formData[field.id]['tTruck']} onClick={(e) => handleChangeTemp(e, -1)}>&minus;</button>
                                        <button
                                            className={styles.button}
                                            id={field.id}
                                            name='tTruck'
                                            tabIndex="-1"
                                            value={formData[field.id]['tTruck']} onClick={(e) => handleChangeTemp(e, 1)}>+</button>
                                    </div>
                                </div>
                                <div>
                                    <div>В резервуаре до слива:</div>
                                    <div className={styles.inputline}>
                                        <input
                                            className={styles.input}
                                            id={field.id}
                                            name='dBefore'
                                            value={(formData[field.id]['dBefore'])}
                                            type='text'
                                            inputMode='numeric'
                                            maxLength={5}
                                            onChange={handleChangeDens}
                                            onFocus={clearOnFocus}
                                            onBlur={handleBlurD}
                                        />
                                        <button
                                            className={styles.button}
                                            id={field.id}
                                            name='dBefore'
                                            tabIndex="-1"
                                            value={formData[field.id]['dBefore']} onClick={(e) => handleChangeDens(e, -0.001)}>&minus;</button>
                                        <button
                                            className={styles.button}
                                            id={field.id}
                                            name='dBefore'
                                            tabIndex="-1"
                                            value={formData[field.id]['dBefore']} onClick={(e) => handleChangeDens(e, 0.001)}>+</button>
                                    </div>
                                    <div className={styles.inputline}>
                                        <input
                                            className={styles.input}
                                            id={field.id}
                                            name='tBefore'
                                            value={formData[field.id]['tBefore']}
                                            type='text'
                                            inputMode='numeric'
                                            min={-40}
                                            max={40}
                                            maxLength={2}
                                            onFocus={clearOnFocus}
                                            onChange={handleChangeTemp}
                                        />
                                        <button
                                            className={styles.button}
                                            id={field.id}
                                            name='tBefore'
                                            tabIndex="-1"
                                            value={formData[field.id]['tBefore']} onClick={(e) => handleChangeTemp(e, -1)}>&minus;</button>
                                        <button
                                            className={styles.button}
                                            id={field.id}
                                            name='tBefore'
                                            tabIndex="-1"
                                            value={formData[field.id]['tBefore']} onClick={(e) => handleChangeTemp(e, 1)}>+</button>
                                    </div>
                                </div>
                                <div>
                                    <div>В резервуаре после слива:</div>
                                    <div className={styles.inputline}>
                                        <input
                                            className={styles.input}
                                            id={field.id}
                                            name='dAfter'
                                            value={(formData[field.id]['dAfter'])}
                                            type='text'
                                            inputMode='numeric'
                                            maxLength={5}
                                            onChange={handleChangeDens}
                                            onFocus={clearOnFocus}
                                            onBlur={handleBlurD}
                                        />
                                        <button
                                            className={styles.button}
                                            id={field.id}
                                            name='dAfter'
                                            tabIndex="-1"
                                            value={formData[field.id]['dAfter']} onClick={(e) => handleChangeDens(e, -0.001)}>&minus;</button>
                                        <button
                                            className={styles.button}
                                            id={field.id}
                                            name='dAfter'
                                            tabIndex="-1"
                                            value={formData[field.id]['dAfter']} onClick={(e) => handleChangeDens(e, 0.001)}>+</button>
                                    </div>
                                    <div className={styles.inputline}>
                                        <input
                                            className={styles.input}
                                            id={field.id}
                                            name='tAfter'
                                            value={+formData[field.id]['tAfter']}
                                            type='text'
                                            inputMode='numeric'
                                            min={-40}
                                            max={40}
                                            maxLength={2}
                                            onFocus={clearOnFocus}
                                            onChange={handleChangeTemp}
                                        />
                                        <button
                                            className={styles.button}
                                            id={field.id}
                                            name='tAfter'
                                            tabIndex="-1"
                                            value={formData[field.id]['tAfter']} onClick={(e) => handleChangeTemp(e, -1)}>&minus;</button>
                                        <button
                                            className={styles.button}
                                            id={field.id}
                                            name='tAfter'
                                            tabIndex="-1"
                                            value={formData[field.id]['tAfter']} onClick={(e) => handleChangeTemp(e, 1)}>+</button>
                                    </div>
                                </div>
                            </div>


                        </div>
                    )
                })}</div>
            </div>

        )
    }



};

export default FuelIntake;