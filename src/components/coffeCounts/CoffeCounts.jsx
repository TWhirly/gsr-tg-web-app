import React, { useCallback, useEffect, useState, useRef } from 'react';
import styles from './CoffeCounts.module.css';
import { localUrl } from '../../localSettings.js'
import 'animate.css';
import { useNavigate, useHistory } from "react-router-dom";
import { NumberField, Label, Group, Input, Button, Cell, Column, Row, Table, TableBody, TableHeader, Text } from 'react-aria-components';
import { useLinkProps } from '@react-aria/utils';
import { useTelegram } from "../../hooks/useTelegram.js";
import { type } from '@testing-library/user-event/dist/type/index.js';

const APIURL = localUrl.APIURL;
const CCNumberfield = NumberField;

const CoffeCounts = () => {
    const navigate = useNavigate();
    const fetchFormFields = async () => {
        const response = await fetch(APIURL + '/coffeCounts', {
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
    const { tg, queryId } = useTelegram();

    tg.MainButton.show();

    const date = new Date();

    useEffect(() => {
        setTotCoffe();
    }, []);

    useEffect(() => {
        const loadFields = async () => {
            const fetchedFields = await fetchFormFields();
            const Ycounts = fetchedFields.pop()
            console.log('fetched', fetchedFields)
            console.log(Ycounts)
            setFields(fetchedFields);
            setYcounts(Ycounts);
            setIsYcountsReady(true);
            // Инициализируем состояние formData с пустыми значениями
            const initialFormData = fetchedFields.reduce((acc, field) => {
                acc[field.id] = field.cnt;

                return acc;
            }, {});
            setFormData(initialFormData);
            console.log('FormData ', fields)
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

    useEffect(() => {
        var n = Object.values(formData).filter((item) => !isNaN(item)).reduce((sum, item) => sum + +item, 0)
        console.log('change ', formData, 'sum ',)
        const getDrinkWord = (n) => {
            if (n % 10 === 1 && n % 100 !== 11) {
                return 'напиток';
            } else if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) {
                return 'напитка';
            } else {
                return 'напитков';
            }
        };

        const getTotalDrinksMessage = (n, Ycounts) => {
            const total = n - Ycounts.sum;
            const drinkWord = getDrinkWord(total);
            if (Ycounts.time !== false) {
                return `Итого ${total} ${drinkWord} за период с ${Ycounts.time} по настоящее время`;
            }
            else {
                return `Вчера счётчики кофемашины введены не были, рассчитать количество проданных за смену напитков невозможно. Введите актуальные счетчики сейчас 
                для того чтобы расчет стал возможен завтра. Сообщите руководителю АЗС о возникшей проблеме.`
            }
        };
        setTotCoffe(getTotalDrinksMessage(n, Ycounts));
    }, [formData, fields]);

    const handleSubmit = () => {
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

    useEffect(() => {
        tg.onEvent('mainButtonClicked', handleSubmit)
        return () => {
            tg.offEvent('mainButtonClicked', handleSubmit)
        }
    }, [handleSubmit])


    return (
        <div className={styles.container}>
            <header className={styles.header}>Счётчики кофемашины</header>
            <div className={styles.formContainer}>


                <Group className={styles.inputs}>{fields.map((field) => {
                    return (
                        <div className={styles.numberField} key={field.id}>
                            <NumberField id={field.id} value={formData[field.id]} aria-label="e"
                                minValue={0}
                                description={field.id}
                                // isRequired={true}
                                onInput={handleInput}
                                onChange={(v) => handleChange(v, field.id)}>
                                <Label className={styles.inputtype}>{field.id}</Label>
                                <div className={styles.inputLine}>
                                    <Button className={styles.reactAriaButton} slot="decrement">&minus;</Button>
                                    <Input className={styles.input} />
                                    {/* <Text className={styles.description} slot="description">{field.id}</Text> */}
                                    <Button className={styles.reactAriaButton} slot="increment">+</Button>
                                </div>
                            </NumberField>
                        </div>

                    );

                })}

                </Group>




            </div>
            <div className={styles.totcoffe}>{(ycountsReady && TotCoffe)}</div>
            {/* <Button className={styles.submit} onPress={handleSubmit}  >Отправить</Button> */}
        </div>
    )

    return (
        <div className="container">
            <header className="header">Счётчики кофемашины</header>
            <div className='group'>{fields.map((field) => {
                return (
                    <div className="number-field" key={field.id}>
                        <CCNumberfield id={field.id} value={formData[field.id]} aria-label="e"
                            minValue={0}
                            description={field.id}
                            isRequired={true}
                            onInput={handleInput}
                            onChange={(v) => handleChange(v, field.id)}>
                            <Group >
                                <Button slot="decrement">&minus;</Button>
                                <Input className='Input1' />
                                <Text className="description" slot="description">{field.id}</Text>
                                <Button slot="increment">+</Button>
                            </Group>
                        </CCNumberfield>
                    </div>
                )
            })}</div>
            <div className='totcoffe'>{(ycountsReady && TotCoffe)}</div>
            <Button className="submit" onPress={handleSubmit}  >Отправить</Button>
        </div>
    );
}

export default CoffeCounts;