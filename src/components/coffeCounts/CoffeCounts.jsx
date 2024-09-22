import React, { useCallback, useEffect, useState, useRef } from 'react';
import './CoffeCounts.css';
import { localUrl } from '../../localSettings.js'
import 'animate.css';
import { useNavigate, useHistory } from "react-router-dom";
import { NumberField, Label, Group, Input, Button, Cell, Column, Row, Table, TableBody, TableHeader, Text } from 'react-aria-components';
import { useLinkProps } from '@react-aria/utils';
import { useTelegram } from "../../hooks/useTelegram.js";
import { type } from '@testing-library/user-event/dist/type/index.js';


// import { Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';

const APIURL = localUrl.APIURL;



const CoffeCounts = () => {

    // const history = useHistory();
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
    const [allFieldsFilled, setIsFormComplete] = useState(false);

    const [TotCoffe, setTotCoffe] = useState('');
    useEffect(() => {
        setTotCoffe();
    }, []);

    useEffect(() => {
        const loadFields = async () => {
            const fetchedFields = await fetchFormFields();
            setFields(fetchedFields);
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
        // setFormDataInputs((prevData) => ({
        //     ...prevData,
        //     [id]: value,
        // }));


        // const totalCount = formData((sum, item) => sum + item.cnt, 0)


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
        console.log('change ', formData, 'sum ', )
        const getDrinkWord = (n) => {
            if (n % 10 === 1 && n % 100 !== 11) {
                return 'напиток';
            } else if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) {
                return 'напитка';
            } else {
                return 'напитков';
            }
        };
        const getTotalDrinksMessage = (n) => {
            const drinkWord = getDrinkWord(n);
            return `Итого ${n} ${drinkWord}`;
        };
        setTotCoffe(getTotalDrinksMessage(n));
    }, [formData, fields]);



    const handleSubmit = () => {
        console.log(allFieldsFilled);
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
        //    navigate('/')
        navigate('/', {
            replace: true,
            state: { sent: true }
        });


    }

    return (
        <>
            <h3 className='header'>Введите показания счетчиков кофемашины</h3>
            {fields.map((field) => {
                return (
                    <div className="number-field" key={field.id}>
                        <NumberField id={field.id} value={formData[field.id]} aria-label="e"
                            minValue={0}
                            description={field.id}
                            // defaultValue={''} 
                            isRequired={true}
                            // maxValue={99999} 
                            onInput={handleInput}
                            onChange={(v) => handleChange(v, field.id)}

                        >
                            <Group >
                                <Button slot="decrement">&minus;</Button>
                                <Input />
                                <Text className="description" slot="description">{field.id}</Text>
                                <Button slot="increment">+</Button>

                            </Group>


                        </NumberField>
                    </div>
                )
            })}
            {TotCoffe}
            {<Button onPress={handleSubmit} className={'Submit'} >Отправить</Button>}
        </>
    )
};

export default CoffeCounts;