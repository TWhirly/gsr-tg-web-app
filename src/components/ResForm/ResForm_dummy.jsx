import React, { useCallback, useEffect, useState, useRef, useContext } from 'react';
import './ResForm.css';
import { localUrl } from '../../localSettings.js'
import 'animate.css';
import { json, useNavigate } from "react-router-dom";
import { NumberField, Label, Group, Input, Button, Cell, Column, Row, Table, TableBody, TableHeader, SelectValue } from 'react-aria-components';
import { useLinkProps } from '@react-aria/utils';
import { useTelegram } from "../../hooks/useTelegram";
import { type } from '@testing-library/user-event/dist/type/index.js';
import { NumberFieldStateContext } from 'react-aria-components';
// import { Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';

const APIURL = localUrl.APIURL;

const ResForm = () => {
    const navigate = useNavigate();
    const fetchFormFields = async () => {
        //const response = await fetch(APIURL + '/res'); // Генерируем объект Response
        //const jVal = await response.json(); // Парсим тело ответа
        //return jVal;
        return [{ id: '95(1)' }, { id: '92(2)' }, { id: '100(3)' }];
    };
    const [fields, setFields] = useState([]);
    const [formData, setFormData] = useState({});
    const [isFormComplete, setIsFormComplete] = useState(false);
    let formDataInputs = {};

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
        console.log("[handleChange]", "formData =", formData);
        console.log("[handleChange]", "formDataInputs =", formDataInputs);
        console.log("[handleChange]", "SetFormData on next render will be =", { ...formData, [id]: value, });
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    const handleSubmit = () => {
        console.log("[handleSubmit]", "isFormComplete =", isFormComplete);
        console.log("[handleSubmit]", "trying to submit formData =", formData);
        // fetch(APIURL + '/web-data', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ ...formData, initData: window.Telegram.WebApp.initData })
        // })
        // navigate('/');
    };

    const DummyComponent = (props) => {
        const context = useContext(NumberFieldStateContext);
        formDataInputs = { ...formDataInputs, [props.fieldId]: context.numberValue };
        useEffect(() => {
            const isFormCompleteInputs = fields.every(e => (!isNaN(formDataInputs[e.id])));
            console.log("[USE EFFECT that trigger on every render of DummyComponent]",
                "props.fieldId =", props.fieldId,
                "context.numberValue =", context.numberValue,
                "formDataInputs =", formDataInputs,
                "isFormCompleteInputs =", isFormCompleteInputs);
            setIsFormComplete(isFormCompleteInputs);
        });
    };

    return (
        <>
            <h3 style={{ textAlign: 'center' }}>Введите текущие расчетные остатки</h3>
            {fields.map((field) => {
                return (
                    <NumberField id={field.id} value={formData[field.id]}
                        minValue={0}
                        key={field.id}
                        isRequired={true}
                        maxValue={99999}
                        onChange={(v) => handleChange(v, field.id)}
                    >
                        <Label > {field.id}</Label>
                        <Group >
                            <Button slot="decrement">&minus;</Button>
                            <Input />
                            <Button slot="increment">+</Button>
                        </Group>
                        <DummyComponent fieldId={field.id} />
                    </NumberField>
                )
            })}
            {(isFormComplete && <center>"Отправить" (без фейда в 2 секунды для дебага)</center>)}
            {(isFormComplete && <Button onPress={handleSubmit} className={'Submit'} >Отправить</Button>)}
        </>
    )

};

export default ResForm;

