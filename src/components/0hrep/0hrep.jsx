import React, { useState } from 'react';
import { useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import IntField from '../InputFields/intField';

const ShiftRep = () => {

    const products = [
        { id: '1', key: 'Джинсы', amt: 5000, description: 'Синего цвета, прямые' },
        { id: '2', key: 'Куртка', amt: 12000, description: 'Зеленого цвета, теплая' },
        { id: '3', key: 'Джинсы 2', amt: 5000, description: 'Синего цвета, прямые' },
        { id: '4', key: 'Куртка 8', amt: 122, description: 'Зеленого цвета, теплая' },
        { id: '5', key: 'Джинсы 3', amt: 5000, description: 'Синего цвета, прямые' },
        { id: '6', key: 'Куртка 7', amt: 600, description: 'Зеленого цвета, теплая' },
        { id: '7', key: 'Джинсы 4', amt: 5500, description: 'Синего цвета, прямые' },
        { id: '8', key: 'Куртка 5', amt: 12000, description: 'Зеленого цвета, теплая' },
    ]

    const onChange = (id, key) => {
        console.log(id, key)
    }

    return (
        products.map((item) => {
            return (
                <div>
                    {item.key}
                    <IntField
                        id={item.id}
                        name={item.key}
                        val={item.amt}
                        incStep={1}
                        onChange={onChange}
                    >
                    </IntField>
                </div>
            )
        })
    )
}

export default ShiftRep;