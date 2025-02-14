import React, { useCallback, useEffect, useState, useRef, Component } from 'react';
import styles from './shopOrders.module.css';
import CircularProgress from '@mui/joy/CircularProgress';
import Box from '@mui/joy/Box';
import { localUrl } from '../../localSettings.js'
import '/node_modules/animate.css/animate.css';
import { useNavigate, useHistory } from "react-router-dom";
import { Label, Group, Input, Button, Cell, Column, Row, Table, TableBody, TableHeader, Text } from 'react-aria-components';
import { Link, Element, Events, animateScroll as scroll } from 'react-scroll';


const APIURL = localUrl.APIURL;



const ShopOrders = () => {
    const navigate = useNavigate();

    const fetchFormFields = async () => {
        const response = await fetch(APIURL + '/shopOrders/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ initData: window.Telegram.WebApp.initData })
        }); // Генерируем объект Response
        const jVal = await response.json(); // Парсим тело ответа
        console.log('Jval is ', jVal)
        return jVal

    };

    const [fields, setFields] = useState([]);
    const [formData, setFormData] = useState({});
    const [recievedFormData, setRecievedFormData] = useState({});
    const [showAdditionalFields, setShowAdditionalFields] = useState(new Map());
    const [toggleState, setToggleState] = useState(false);
    const [toggleClear, setToggleClear] = useState(false);
    const [formLoad, setFormLoad] = useState(false)






    useEffect(() => {
        const loadFields = async () => {
            const fetchedFields = await fetchFormFields();
            console.log('fetched', fetchedFields, typeof (fetchedFields))
            setFields(fetchedFields);

            fetchedFields.forEach((key) => {
                showAdditionalFields.set(key.date + key.ca, false)
            });

            console.log('additional', showAdditionalFields)


            const initialFormData = fetchedFields.reduce((acc, item) => {
                if (!acc[item.date]) {
                    acc[item.date] = {};
                }

               

                   
                if (!acc[item.date][item.ca]) {
                    acc[item.date][item.ca] = {};
                    if(!acc[item.date][item.ca]['manager']){
                        acc[item.date][item.ca] = {manager: item.manager}
                       }
                }
                acc[item.date][item.ca][item.nomenclature] = item.amt;
              
                return acc;
            }, {});

            setFormData(initialFormData);
            setRecievedFormData(initialFormData);
            setFormLoad(true)

        };

        loadFields();
    }, []);


    useEffect(() => {
        setShowAdditionalFields(showAdditionalFields)
    }, [showAdditionalFields, toggleState])

    const showAll = (e, name) => {
        console.log('e.target', name)
        setToggleState(toggleState == true ? false : true)
        if (showAdditionalFields.get(name) === true) {
            showAdditionalFields.set(name, false)
        }
        else {
            showAdditionalFields.set(name, true)
        }
        setShowAdditionalFields(showAdditionalFields)
    }

    const handleChange = (value, id) => {
        setToggleClear(false);
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
        recievedFormData[id] = value;
        const date = (new Date()).toLocaleDateString();
    };


    if(formLoad){
    return (
        <div className={styles.container} name='main'>
            {Object.keys(formData).map(date => (
                <div className={styles.dateBlock} key={date}>
                    <h2 className={styles.date}> {date}</h2>
                    {Object.keys(formData[date]).map(ca => (
                        <div className={styles.caBlock} key={ca} name={date+ca}>
                            <h3 className={styles.ca}>{ca}</h3>
                            <div className={styles.manager}>{formData[date][ca]['manager']}</div>
                            <div className={`${styles.nomenclatureBlock} ${!showAdditionalFields.get(date + ca) ? '' : styles.hide}`}>
                                {Object.keys(formData[date][ca]).filter((nomenclature) => Object.keys(formData[date][ca]).indexOf(nomenclature) < 4 && nomenclature != 'manager').map((nomenclature) => (
                                    <div className={styles.nomenclatureRow} >
                                        <div className={styles.no}>
                                            {Object.keys(formData[date][ca]).indexOf(nomenclature)}
                                        </div>
                                        <div className={styles.nomenclature}>
                                            {nomenclature}
                                        </div>
                                        <div className={styles.amt}>
                                            {formData[date][ca][nomenclature]}
                                        </div>
                                    </div>

                                ))}
                                <Link to={date+ca} smooth={true} duration={500} 
                                    className={styles.expand}
                                    onClick={(e) => showAll(e, date + ca)}
                                >
                                    {Object.keys(formData[date][ca]).length > 4 ? 'Показать все (' + (Object.keys(formData[date][ca]).length - 1)+ ')' : ''}
                                </Link>
                            </div >
                            <div className={`${styles.nomenclatureBlock} ${showAdditionalFields.get(date + ca) ? '' : styles.hide}`}>
                               
                                {Object.keys(formData[date][ca]).filter((nomenclature) => nomenclature != 'manager').map((nomenclature) => (
                                    <div className={styles.nomenclatureRow} >
                                    <div className={styles.no}>
                                        {Object.keys(formData[date][ca]).indexOf(nomenclature)}
                                    </div>
                                    <div className={styles.nomenclature}>
                                        {nomenclature}
                                    </div>
                                    <div className={styles.amt}>
                                        {formData[date][ca][nomenclature]}
                                    </div>
                                </div>
                                ))}
                                <Link to={date+ca}  className={styles.expand}
                                    onClick={(e) => showAll(e, date + ca)}
                                >
                                    {Object.keys(formData[date][ca]).length > 3 ? 'Свернуть' : ''}
                                </Link>
                            </div>
                        </div>
                    ))}

                </div>
            ))}
        </div>
    );
}
else{
    return (
        <Box className={styles.progress} >
            <CircularProgress variant="plain" />
        </Box>
    )
}

}

export default ShopOrders;