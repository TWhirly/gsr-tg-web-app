import React, { useCallback, useEffect, useState, useRef } from 'react';
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
    const [cal, setCal] = useState([]);
    const [recievedFormData, setRecievedFormData] = useState({});
    const [formDataInputs, setFormDataInputs] = useState({});
    const [allFieldsFilled, setIsFormComplete] = useState(false);

    useEffect(() => {
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
        }
        const loadFields = async () => {
            const fetchedFields = await fetchFormFields();
            setFields(fetchedFields);
            const initialFormData = fetchedFields.reduce((acc, field) => {
                Object.keys(field).map((key) => {
                    if (!acc[field.id]) {
                        acc[field.id] = {}
                        acc[field.id]['awaitH'] = 0
                    }
                    if (key !== 'id') {
                        acc[field.id][key] = field[key]
                    }

                })
                return acc;
            }, {});
            setFormData(initialFormData);
            setRecievedFormData(initialFormData);
            

        };
        loadFields();
        loadCalibration();
       
    }, []);

        const calcAwaitH = (h, id) => {
        console.log('calc')
        let volume
        if (+h > 1) {
            volume = (cal[formData[id]['tank']][Math.trunc(h)] -
                (cal[formData[id]['tank']][Math.trunc(h) - 1] ? cal[formData[id]['tank']][Math.trunc(h) - 1] : cal[formData[id]['tank']][Math.trunc(h)]))
                * (h - Math.trunc(h)) +
                cal[formData[id]['tank']][Math.trunc(h)];
        }
        else {
            volume = 0;
        }
        // cal[formData[id]['tank']][Math.trunc(h) - 1]
        console.log('vol is ', volume)
        const awaitVol = +volume + +formData[id]['waybill']
        console.log('await vol is ', awaitVol)
        for (let i = 0; i < Object.entries(cal[formData[id]['tank']]).length; i++) {
            if (Object.entries(cal[formData[id]['tank']])[i][1] > awaitVol) {
                var height = [Object.entries(cal[formData[id]['tank']])[i - 1], Object.entries(cal[formData[id]['tank']])[i]]
                break
            }
        }
        console.log('calculated height is ', height)
        return ((Math.ceil((((awaitVol - height[0][1]) / ((height[1][1] - height[0][1]))) + +height[0][0]) * 10)) / 10)



    }

    const handleChange = (e, d) => {
        console.log('onChange', e.target)
        console.log(formData)
        const id = e.target.id
        const key = e.target.name
        var value
        if (d) {
            value = (+e.target.value + (d ? +d : 0)).toFixed(1)
        }
        else {
            value = e.target.value
        }
        setFormData(prevData => ({
            ...prevData,
            [id]: {
                ...prevData[id],
                [key]: value,
                awaitH: calcAwaitH(value, id),
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
    const testobj = {1: {1: 1, 2: 2}, 2: {1: 3, 2: 4}}
    // const keys1 = Object.keys(cal[1])
    console.log('render', Object.keys(formData));
    console.log('calib', cal[1]);
    // console.log('calib ', cal['1']['maxH'], typeof(cal['1']))
    // console.log('calib ', fieldsCal)

    return (
        <div className={styles.container}>


            <group className={styles.group}>
                <h4 className={styles.subheader}>Поступления НП сегодня, {(new Date).toLocaleDateString()}</h4>
                <div className={styles.inputs}>{fields.map((field) => {
                    return (
                        <div className={styles.intakeBlock} key={field.id}>
                            <div className={styles.fueltype}>{field.fuel !== 'ДТ' ? 'АИ-' + field.fuel : field.fuel} </div>
                            <div>Резервуар № {field.tank}</div>
                            <div>{field.driver}</div>
                            <div>{field.plates} </div>
                            <div>Секции: {field.sections}</div>
                            <div>Объем по накладной: {field.waybill}</div>
                            {/* {cal[field.tank]['maxH']} */}
                            <div>
                                <div>Уровень до слива, см</div>
                                <input
                                    id={field.id}
                                    name='hBefore'
                                    value={formData[field.id]['hBefore']}
                                    type='number'
                                    inputMode='numeric'
                                    min={0}
                                    // max={+cal[field.tank]['maxH']}
                                    // step={0.1}
                                    onChange={handleChange}
                                />
                                <button id={field.id}
                                    name='hBefore'
                                    value={formData[field.id]['hBefore']} onClick={(e) => handleChange(e, -0.1)}>&minus;</button>
                                <button id={field.id}
                                    name='hBefore'
                                    value={formData[field.id]['hBefore']} onClick={(e) => handleChange(e, 0.1)}>+</button>
                            </div>
                            <div>Ожидаемый уровень: {(formData[field.id]['awaitH']).toString().replace('.', ',')}</div>


                        </div>
                    )
                })}</div>
            </group>

            {(allFieldsFilled && <Button onPress={handleSubmit} className={styles.submit} >Отправить</Button>)}
        </div>

    )



};

export default FuelIntake;