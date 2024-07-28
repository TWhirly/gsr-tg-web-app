import React, {useState} from 'react';
import './ButtonList.css';
import ButtonItem from "../ButtonItem/ButtonItem";
import {useTelegram} from "../../hooks/useTelegram";
import {useCallback, useEffect} from "react";

const buttons = [
    {id: '1', title: 'Джинсы', price: 5000, description: 'Синего цвета, прямые'},
    {id: '2', title: 'Куртка', price: 12000, description: 'Зеленого цвета, теплая'},
    {id: '3', title: 'Джинсы 2', price: 5000, description: 'Синего цвета, прямые'},
    {id: '4', title: 'Куртка 8', price: 122, description: 'Зеленого цвета, теплая'},
    {id: '5', title: 'Джинсы 3', price: 5000, description: 'Синего цвета, прямые'},
    {id: '6', title: 'Куртка 7', price: 600, description: 'Зеленого цвета, теплая'},
    {id: '7', title: 'Джинсы 4', price: 5500, description: 'Синего цвета, прямые'},
    {id: '8', title: 'Куртка 5', price: 12000, description: 'Зеленого цвета, теплая'},
]

const ButtonList = () =>{

    const onPush = (button) =>{
        tg.MainButton.show()
        tg.MainButton.setParams({
            text: `Перейти к ${button}`
           
        })

    }

    return (
        <div className={'list'}>
            {buttons.map(item => (
                <ButtonItem
                    button={item.buttons.price}
                    className={'item'}
                    onPush={onPush}
                />
            ))}
        </div>
    );

}

export default ButtonList;