import React, { useState } from 'react';
import './ButtonList.css';
import ButtonItem from "../ButtonItem/ButtonItem";
import { useTelegram } from "../../hooks/useTelegram";
import { useCallback, useEffect } from "react";
import { Button } from "../button/button"

const buttons = [
    { id: '1', description: 'Синего цвета, прямые', title: 'Джинсы', price: 5000 },
    { id: '2', title: 'Куртка', price: 12000, description: 'Зеленого цвета, теплая' },
    { id: '3', title: 'Джинсы 2', price: 5000, description: 'Синего цвета, прямые' },
    { id: '4', title: 'Куртка 8', price: 122, description: 'Зеленого цвета, теплая' },
    { id: '5', title: 'Джинсы 3', price: 5000, description: 'Синего цвета, прямые' },
    { id: '6', title: 'Куртка 7', price: 600, description: 'Зеленого цвета, теплая' },
    { id: '7', title: 'Джинсы 4', price: 5500, description: 'Синего цвета, прямые' },
    { id: '8', title: 'Куртка 5', price: 12000, description: 'Зеленого цвета, теплая' },
]

const ButtonList = () => {
    const { tg, queryId } = useTelegram();

    const onPush = (item) => {
        tg.MainButton.show()
        tg.MainButton.setParams({
            text: `Перейти к ${item.title}`

        })

    }

    // let res = buttons.map(function (item) {
    //     return(
    //     <p key={item.id}>
    //         <ButtonItem button={item} onPush={onPush} className={'item'} />
    //     </p>)
    // });

    // return <div>
    //     {res}
    // </div>;

    // return (
    //     <div className={'list'}>
    //         {buttons.map(item => (
    //             <ButtonItem
    //                 button={item}
    //                 className={'item'}
    //                 onPush={onPush}
    //             />
    //         ))}




    //     </div>
    // );
    // const listItems = buttons.map(item => item.title)
    return (
        <div className={'list'}>

            {buttons.map(item => (<button>{item.title}</button>))}







        </div>
    );

}

export default ButtonList;