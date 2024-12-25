import React, { useState, useEffect } from "react";
import { useNavigate, useHistory } from "react-router-dom";
import IntField from '../InputFields/NumField.jsx';
import NumField from '../InputFields/NumField.jsx';
import { localUrl } from '../../localSettings.js'

const APIURL = localUrl.APIURL;

const ShiftRep = () => {
    const [data, setData] = useState([]);

    const buttons = async () => {
        try {
            const response = await fetch(APIURL + '/menu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ initData: window.Telegram.WebApp.initData })
            }); // Генерируем объект Response
            if (response.ok) {
                const jVal = await response.json(); // Парсим тело ответа
                setData(jVal);
                console.log(jVal)
            }
            else {
                console.error('Promise resolved but HTTP status failed')
            }
        }
        catch (error) {
            console.log('buttons Promise rejected')
            setData([])
        }
    };

    useEffect((buttons) => {
        
    },[data])

    const productsLoad = [
        { id: '1', key: 'Джинсы', amt: 5000, description: 'Синего цвета, прямые' },
        { id: '2', key: 'Куртка', amt: 12000, description: 'Зеленого цвета, теплая' },
        { id: '3', key: 'Джинсы 2', amt: 5000, description: 'Синего цвета, прямые' },
        { id: '4', key: 'Куртка 8', amt: 122, description: 'Зеленого цвета, теплая' },
        { id: '5', key: 'Джинсы 3', amt: 5000, description: 'Синего цвета, прямые' },
        { id: '6', key: 'Куртка 7', amt: 600, description: 'Зеленого цвета, теплая' },
        { id: '7', key: 'Джинсы 4', amt: 5500, description: 'Синего цвета, прямые' },
        { id: '8', key: 'Куртка 5', amt: 12000, description: 'Зеленого цвета, теплая' },
    ]

    const [products, setProducts] = useState(productsLoad)

    useEffect(()=> {
        setProducts(productsLoad)
    }, [])

    const onChange = (id, key) => {
        console.log(id, key)
    }

    return (
        products.map((item) => {
            return (
                <div
                key={item.id}>
                    {item.key}
                    <NumField
                    key={item.id}
                        id={item.id}
                        name={item.key}
                        val={item.amt}
                        incStep={1}
                        onChange={onChange}
                    >
                    </NumField>
                </div>
            )
        })
    )
};

export default ShiftRep;