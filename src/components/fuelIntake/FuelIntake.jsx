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
            body: JSON.stringify({initData: window.Telegram.WebApp.initData })
        }); // Генерируем объект Response
        const jVal = await response.json(); // Парсим тело ответа
        return jVal
    };

    const [fields, setFields] = useState([]);
    const [formData, setFormData] = useState({});
    const [formDataInputs, setFormDataInputs] = useState({});
    const [allFieldsFilled, setIsFormComplete] = useState(false);

    useEffect(() => {
        const loadFields = async () => {
            const fetchedFields = await fetchFormFields();
            setFields(fetchedFields);
            // Инициализируем состояние formData с пустыми значениями
            const initialFormData = fetchedFields.reduce((acc, field) => {
                acc[field.id] = NaN;

                return acc;
            }, {});
            setFormData(initialFormData);
            
        };

        loadFields();
    }, []);

    const handleChange = (value, id) => {
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));

        setFormDataInputs((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    const handleInput = (e) => {
       const id = e.target['id'];
       const value = e.target['value'].toString().replace(/\s/g,'');
       console.log(e.target['value'])
        setFormDataInputs((prevData) => ({
            ...prevData,
            [id]: value,
        }));
        console.log('input ', formData)
       
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
        navigate('/', {replace: true,
             state: {sent: true}
          });
          

    }

    console.log('render');
    
    return(
        <div className={styles.container}>
            
           
            <group className={styles.group}>
                <h4 className={styles.subheader}>Поступления НП сегодня, {(new Date).toLocaleDateString()}</h4>
                <Group className={styles.inputs}>{fields.map((field) => {
                    return (
                        <div className={styles.numberField} key={field.id}>
                            <div>{field.fuel !== 'ДТ'? 'АИ-'+field.fuel : field.fuel}
                            {field.driver}
                            {field.plates} 
                            Секции: {field.sections}
                            Объем по накладной: {field.waybill}
                            </div>
                            <NumberField id={field.id} value={formData[field.id]} aria-label="e"
                                minValue={0}
                                description={field.name}
                                // isRequired={true}
                                onInput={handleInput}
                                onChange={(v) => handleChange(v, field.id)}>
                                     <Label className={styles.inputLineWithLabel}>
                                        <div className={styles.label}> Уровень до слива </div> 
                                       
                                <div className={styles.inputLine}>
                                    <Button className={styles.reactAriaButton} slot="decrement">&minus;</Button>
                                    <Input className={styles.input} />
                                    <Button className={styles.reactAriaButton} slot="increment">+</Button>
                                </div>
                                </Label>
                            </NumberField>
                        </div>
                    )
                })}</Group>
            </group>
           
            {(allFieldsFilled && <Button onPress={handleSubmit} className={styles.submit} >Отправить</Button>)}
            </div>
            
    )

   

};

export default FuelIntake;