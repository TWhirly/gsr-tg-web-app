import React, { useCallback, useEffect, useState, useRef, Component } from 'react';
import styles from './RepArchive.module.css';
import CircularProgress from '@mui/joy/CircularProgress';
import Box from '@mui/joy/Box';
import { localUrl } from '../../localSettings.js'
import '/node_modules/animate.css/animate.css';
import { useNavigate, useHistory } from "react-router-dom";
import { Label, Group, Input, Button, Cell, Column, Row, Table, TableBody, TableHeader, Text } from 'react-aria-components';
import { Link, Element, Events, animateScroll as scroll } from 'react-scroll';


const APIURL = localUrl.APIURL;



const RepArchive = () => {
    const navigate = useNavigate();

    const fetchFormFields = async () => {
        const response = await fetch(APIURL + '/repArchive/', {
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


    const getRecieptWord = (n) => {
        if (n % 10 === 1 && n % 100 !== 11) {
            return 'чек';
        } else if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) {
            return 'чека';
        } else {
            return 'чеков';
        }
    };




    useEffect(() => {
        const loadFields = async () => {
            const fetchedFields = await fetchFormFields();
            console.log('fetched', fetchedFields, typeof (fetchedFields))
            setFields(fetchedFields);

            fetchedFields.forEach((key) => {
                showAdditionalFields.set(key.date, false)
            });

            console.log('additional', showAdditionalFields)


            setFields(fetchedFields)
            
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
        console.log('render', fields[0].date)
        // fields.map(item => (console.log(item.date)))
    return (
        <div className={styles.container} name='main'>
            {fields.map(item => (
                <div className={styles.dateBlock} name={item.date}>
                    <div className={styles.date}> {item.date}</div>
                    <div className={styles.nomenclatureBlock} >{item.operator1? `${item.operator1} (${item.reciepts1} ${getRecieptWord(item.reciepts1)})`  : ''}</div>
                    <div className={styles.nomenclatureBlock}>{item.operator2? `${item.operator2} (${item.reciepts2} ${getRecieptWord(item.reciepts2)})`  : ''}</div>
                  <div className={`${styles.nomenclatureBlock} ${!showAdditionalFields.get(item.date) ? '' : styles.hide}`}>Магазин {item.shop}</div>
                  <div className={`${styles.nomenclatureBlock} ${!showAdditionalFields.get(item.date) ? '' : styles.hide}`}>Пролив {item.total}</div>
                  <Link to={item.date} smooth={true} duration={500} 
                                    className={styles.expand}
                                    onClick={(e) => showAll(e, item.date)}
                                >
                                    {showAdditionalFields.get(item.date) ? '' : 'Подробно'}
                                </Link>
                                <div className={`${styles.nomenclatureBlock} ${showAdditionalFields.get(item.date) ? '' : styles.hide}`}>
                               
                               <div>
                                {item.consolidated}
                               </div>
                                <Link to={item.date}  className={styles.expand}
                                    onClick={(e) => showAll(e, item.date)}
                                >
                                    Свернуть
                                </Link>
                            </div>
                  

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

export default RepArchive;