import React, { useCallback, useEffect, useState, useRef, Component } from 'react';
import styles from './GasForm.module.css';
import { localUrl } from '../../localSettings.js'
import 'animate.css';
import { useNavigate, useHistory } from "react-router-dom";
import { NumberField, Label, Group, Input, Button, Cell, Column, Row, Table, TableBody, TableHeader, Text } from 'react-aria-components';
import { useLinkProps } from '@react-aria/utils';
import { useTelegram } from "../../hooks/useTelegram.js";
import { type } from '@testing-library/user-event/dist/type/index.js';

const APIURL = localUrl.APIURL;
const CCNumberfield = NumberField;

const GasForm = () => {
    const navigate = useNavigate();
    const fetchFormFields = async () => {
        const response = await fetch(APIURL + '/gas', {
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
    const [formData, setFormData] = useState({});
    let [formDataInputs, setFormDataInputs] = useState({});
    const [ycountsReady, setIsYcountsReady] = useState(false);
    const [Ycounts, setYcounts] = useState({});
    const [TotCoffe, setTotCoffe] = useState('');

    const date = new Date();

    useEffect(() => {
        setTotCoffe();
    }, []);

    useEffect(() => {
        const loadFields = async () => {
            const fetchedFields = await fetchFormFields();

            console.log('fetched', fetchedFields)
            console.log(Ycounts)
            setFields(fetchedFields);
            setIsYcountsReady(true);
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
        fetch(APIURL + '/sendCoffeCounts', {
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
    return (
        <div className={styles.container}>
            <header className={styles.header}>Газовые баллоны</header>
            <div className={ styles.formContainer }>
            <group className={styles.group}>
                <h4 className={styles.subheader}>Реализация</h4>
                <Group className={styles.inputs}>{fields.filter((item) => (item.id) == 'sales').map((field) => {
                    return (
                        <div className={styles.numberField} key={field.id}>
                            <CCNumberfield id={field.id} value={formData[field.id]} aria-label="e"
                                minValue={0}
                                description={field.name}
                                // isRequired={true}
                                onInput={handleInput}
                                onChange={(v) => handleChange(v, field.id)}>
                                <Group >
                                    <Button slot="decrement">&minus;</Button>
                                    <Input className={styles.Input} />
                                    <Text className={styles.description} slot="description">{field.name}</Text>
                                    <Button slot="increment">+</Button>
                                </Group>
                            </CCNumberfield>
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
                            <CCNumberfield id={field.id} value={formData[field.id]} aria-label="e"
                                minValue={0}
                                description={field.name}
                                // isRequired={true}
                                onInput={handleInput}
                                onChange={(v) => handleChange(v, field.id)}>
                                <Group >
                                    <Button slot="decrement">&minus;</Button>
                                    <Input className={styles.Input} />
                                    <Text className={styles.description} slot="description">{field.name}</Text>
                                    <Button slot="increment">+</Button>
                                </Group>
                            </CCNumberfield>
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
                            <CCNumberfield id={field.id} value={formData[field.id]} aria-label="e"
                                minValue={0}
                                description={field.name}
                                // isRequired={true}
                                onInput={handleInput}
                                onChange={(v) => handleChange(v, field.id)}>
                                <Group >
                                    <Button slot="decrement">&minus;</Button>
                                    <Input className={styles.Input} />
                                    <Text className={styles.description} slot="description">{field.name}</Text>
                                    <Button slot="increment">+</Button>
                                </Group>
                            </CCNumberfield>
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
                            <CCNumberfield id={field.id} value={formData[field.id]} aria-label="e"
                                minValue={0}
                                description={field.name}
                                // isRequired={true}
                                onInput={handleInput}
                                onChange={(v) => handleChange(v, field.id)}>
                                <Group >
                                    <Button slot="decrement">&minus;</Button>
                                    <Input className={styles.Input} />
                                    <Text className={styles.description} slot="description">{field.name}</Text>
                                    <Button slot="increment">+</Button>
                                </Group>
                            </CCNumberfield>
                        </div>
                    )
                })}</Group>
            </group>
            <group className={styles.group}>
                  <h4 className={styles.subheader}>Новые</h4>
                <Group className={styles.inputs}>{fields.filter((item) => ((item.id) == 'new')).map((field) => {
                    return (
                        <div className={styles.numberField} key={field.id}>
                            <CCNumberfield id={field.id} value={formData[field.id]} aria-label="e"
                                minValue={0}
                                description={field.name}
                                // isRequired={true}
                                onInput={handleInput}
                                onChange={(v) => handleChange(v, field.id)}>
                                <Group >
                                    <Button slot="decrement">&minus;</Button>
                                    <Input className={styles.Input} />
                                    <Text className={styles.description} slot="description">{field.name}</Text>
                                    <Button slot="increment">+</Button>
                                </Group>
                            </CCNumberfield>
                        </div>
                    )
                })}</Group>
            </group>
            </div>
            <Button className={styles.submit} onPress={handleSubmit}  >Отправить</Button>
        </div>
    );
}

export default GasForm;