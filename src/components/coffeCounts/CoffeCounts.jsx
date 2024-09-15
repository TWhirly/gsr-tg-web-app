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

        console.log('change ', formData)

    };

    const handleInput = (e) => {
       const id = e.target['id'];
       const value = e.target['value'].toString().replace(/\s/g,'');
    //    const value = e.target['value'];
      

    //    if(value == '' || isNaN(value)){
    //     setIsFormComplete(NaN)
    //    }
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
       
        setIsFormComplete(allFieldsFilled);
    }, [formDataInputs, fields]);

    const handleSubmit = () => {
        console.log(allFieldsFilled);
        console.log(formData)
        console.log("tyring to submit resToSubmit values:", formData);
        fetch(APIURL + '/sendCoffeCounts', {
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

    return (
        <>
            <h3 className='header'>Введите показания счетчиков кофемашины</h3>
            {fields.map((field) => {
                return (
                    <div className="number-field" key={field.id}>
                    <NumberField id={field.id} value={formData[field.id]}
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
            {(allFieldsFilled && <Button onPress={handleSubmit} className={'Submit'} >Отправить</Button>)}
        </>
    )
};

export default CoffeCounts;