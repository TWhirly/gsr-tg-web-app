import React from 'react';
import Button from "../button/button";
import './ButtonItem.css';

const ButtonItem = ({ button, className }) => {

    const onPushHandler = () => {
        onPush(button);
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