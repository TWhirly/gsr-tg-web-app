import React, { useCallback, useEffect, useState, useRef, Component } from 'react';
import styles from './GasForm.module.css';
import CircularProgress from '@mui/joy/CircularProgress';
import Box from '@mui/joy/Box';
import { localUrl } from '../../localSettings.js'
import 'animate.css';
import '../../loader.css'
import { useNavigate, useHistory } from "react-router-dom";
import { NumberField, Label, Group, Input, Button, Cell, Column, Row, Table, TableBody, TableHeader, Text } from 'react-aria-components';
import { useLinkProps } from '@react-aria/utils';
import { useTelegram } from "../../hooks/useTelegram.js";
import { type } from '@testing-library/user-event/dist/type/index.js';

const APIURL = localUrl.APIURL;

const GasForm = () => {
    const navigate = useNavigate();
    const fetchFormFields = async () => {
        try{
        const response = await fetch(APIURL + '/gas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ initData: window.Telegram.WebApp.initData })
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        } // Генерируем объект Response
        const jVal = await response.json(); // Парсим тело ответа
        return jVal
    }
    catch (error) {
        console.log(error); // Устанавливаем ошибку
    }
    };

    const [fields, setFields] = useState([null]);
    var [formData, setFormData] = useState({});
    var [formDataInputs, setFormDataInputs] = useState({});
    const [formReady, setIsFormReady] = useState(false);
    const [Ycounts, setYcounts] = useState({});
    const [TotCoffe, setTotCoffe] = useState('');

    const date = new Date();

    useEffect(() => {
        setTotCoffe();
    }, []);

    useEffect(() => {
        const loadFields = async () => {
            const fetchedFields = await fetchFormFields();
            setFields(fetchedFields);
            setIsFormReady(true);
            // Инициализируем состояние formData с пустыми значениями
            const initialFormData = fetchedFields.reduce((acc, field) => {
                acc[field.id] = field.cnt;
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
        formDataInputs = formData;
    };

    const handleInput = (e) => {
        const id = e.target['id'];
        const value = e.target['value'].toString().replace(/\s/g, '');
        console.log('e ', e.target['value'])

        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));

    };

    const handleSubmit = () => {
        console.log(formData)
        console.log("tyring to submit resToSubmit values:", formData);
        var date = new Date();
        const updDateTime = date.getFullYear() + '-' +
            ('00' + (date.getMonth() + 1)).slice(-2) + '-' +
            ('00' + date.getDate()).slice(-2) + ' ' +
            ('00' + date.getHours()).slice(-2) + ':' +
            ('00' + date.getMinutes()).slice(-2) + ':' +
            ('00' + date.getSeconds()).slice(-2);
        fetch(APIURL + '/sendGas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...formData, initData: window.Telegram.WebApp.initData, datetime: updDateTime })
        })
        navigate('/', {
            replace: true,
            state: { sent: true }
        });

    }
    console.log('type field', fields)
    if (formReady == true) {
        return (
            <div div className={styles.container}>
                <header className={styles.header}>Газовые баллоны</header>
                <div className={styles.formContainer}>
                    <group className={styles.group}>
                        <h4 className={styles.subheader}>Реализация</h4>
                        <Group className={styles.inputs}>{fields.filter((item) => (item.id) == 'sales').map((field) => {
                            return (
                                <div className={styles.numberField} key={field.id}>
                                    <NumberField id={field.id} defaultValue={0} aria-label="e"
                                        minValue={0}
                                        description={field.name}
                                        // isRequired={true}
                                        onInput={handleInput}
                                        onChange={(v) => handleChange(v, field.id)}>
                                        <div className={styles.inputLine}>
                                            <Button className={styles.reactAriaButton} slot="decrement">&minus;</Button>
                                            <Input className={styles.input} />
                                            <Text className={styles.description} slot="description">{field.name}</Text>
                                            <Button className={styles.reactAriaButton} slot="increment">+</Button>
                                        </div>
                                    </NumberField>
                                </div>
                            )
                        })}</Group>
                    </group>
                    <group className={styles.group}>
                        <h4 className={styles.subheader}>Пустые</h4>
                        <Group className={styles.inputs}>{fields.filter((item) => ((item.id) == 'b82e' || (item.id) == '83-99e' ||
                            (item.id) == '00-21e')).map((field) => {
                                return (
                                    <div className={styles.numberField} key={field.id}>
                                        <NumberField id={field.id} value={formData[field.id]} aria-label="e"
                                            minValue={0}
                                            description={field.name}
                                            // isRequired={true}
                                            onInput={handleInput}
                                            onChange={(v) => handleChange(v, field.id)}>
                                            <div className={styles.inputLine}>
                                                <Button className={styles.reactAriaButton} slot="decrement">&minus;</Button>
                                                <Input className={styles.input} />
                                                <Text className={styles.description} slot="description">{field.name}</Text>
                                                <Button className={styles.reactAriaButton} slot="increment">+</Button>
                                            </div>
                                        </NumberField>
                                    </div>
                                )
                            })}</Group>
                    </group>
                    <group className={styles.group}>
                        <h4 className={styles.subheader}>Полные</h4>
                        <Group className={styles.inputs}>{fields.filter((item) => ((item.id) == 'b82f' || (item.id) == '83-99f' ||
                            (item.id) == '00-21f')).map((field) => {
                                return (
                                    <div className={styles.numberField} key={field.id}>
                                        <NumberField id={field.id} value={formData[field.id]} aria-label="e"
                                            minValue={0}
                                            description={field.name}
                                            // isRequired={true}
                                            onInput={handleInput}
                                            onChange={(v) => handleChange(v, field.id)}>
                                            <div className={styles.inputLine}>
                                                <Button className={styles.reactAriaButton} slot="decrement">&minus;</Button>
                                                <Input className={styles.input} />
                                                <Text className={styles.description} slot="description">{field.name}</Text>
                                                <Button className={styles.reactAriaButton} slot="increment">+</Button>
                                            </div>
                                        </NumberField>
                                    </div>
                                )
                            })}</Group>
                    </group>
                    <group className={styles.group}>
                        <h4 className={styles.subheader}>Брак</h4>
                        <Group className={styles.inputs}>{fields.filter((item) => ((item.id) == 'b82d' || (item.id) == '83-99d' ||
                            (item.id) == '00-21d')).map((field) => {
                                return (
                                    <div className={styles.numberField} key={field.id}>
                                        <NumberField id={field.id} value={formData[field.id]} aria-label="e"
                                            minValue={0}
                                            description={field.name}
                                            // isRequired={true}
                                            onInput={handleInput}
                                            onChange={(v) => handleChange(v, field.id)}>
                                            <div className={styles.inputLine}>
                                                <Button className={styles.reactAriaButton} slot="decrement">&minus;</Button>
                                                <Input className={styles.input} />
                                                <Text className={styles.description} slot="description">{field.name}</Text>
                                                <Button className={styles.reactAriaButton} slot="increment">+</Button>
                                            </div>
                                        </NumberField>
                                    </div>
                                )
                            })}</Group>
                    </group>
                    <group className={styles.group}>
                        <h4 className={styles.subheader}>Новые</h4>
                        <Group className={styles.inputs}>{fields.filter((item) => ((item.id) == 'new')).map((field) => {
                            return (
                                <div className={styles.numberField} key={field.id}>
                                    <NumberField id={field.id} value={formData[field.id]} aria-label="e"
                                        minValue={0}
                                        description={field.name}
                                        // isRequired={true}
                                        onInput={handleInput}
                                        onChange={(v) => handleChange(v, field.id)}>
                                        <div className={styles.inputLine}>
                                            <Button className={styles.reactAriaButton} slot="decrement">&minus;</Button>
                                            <Input className={styles.input} />
                                            <Text className={styles.description} slot="description">{field.name}</Text>
                                            <Button className={styles.reactAriaButton} slot="increment">+</Button>
                                        </div>
                                    </NumberField>
                                </div>
                            )
                        })}</Group>
                    </group>
                </div>
                <Button className={styles.submit} onPress={handleSubmit}  >Отправить</Button>
            </div>
        )
    }
    else {
        return (
            <Box className={styles.progress} >
                <CircularProgress variant="plain" />
            </Box>
        )

    };
}

export default GasForm;