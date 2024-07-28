import React from 'react';
import Button from "../button/button";
import './ButtonItem.css';

const ButtonItem = ({ button, className, onPush }) => {

    const onPushHandler = () => {
        onPush(button);
        console.log('tap')
    }


    return (
        <div className={'button ' + className}>



            <Button className={'add-btn'} onClick={onPushHandler}>
                <div className={'img'} />
                <div className={'title'}>{button.title}</div>
            </Button>
        </div>
    );
};

export default ButtonItem;