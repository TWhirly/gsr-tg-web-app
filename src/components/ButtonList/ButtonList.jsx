// import React, { useState, useEffect } from 'react';
import react, { useState, useEffect } from 'react';
import styles from './ButtonList.module.css';
import { useTelegram } from "../../hooks/useTelegram";
import { useNavigate, useLocation } from "react-router-dom";
import { localUrl } from '../../localSettings.js'


// const APIURL = localUrl.APIURL;

// console.log(APIURL)
const APIURL = localUrl.APIURL;
const ButtonList = () => {
    const APIURL = localUrl.APIURL;

    const [data, setData] = useState([]);
    const [Plandata, setPlanData] = useState('');
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


    const planMessage = async () => {
        try {
            console.log('try to fetch plan message')
            const response = await fetch(APIURL + '/planMenu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ initData: window.Telegram.WebApp.initData })
            }); // Генерируем объект Response
            // const jVal = await response.json(); 
            // Парсим тело ответа
            if (response.ok) {
                console.log('resp ok')
                const plan = await response.json()
                setPlanData(plan);
            }
            else {
                console.log('resp not ok')
                setPlanData('Ошибка на сервере')
            }
        }
        catch (error) {
            console.log('planMessage Promise rejected')
            setPlanData('Пользователь не найден, напишите боту "Привет!" для регистрации')
        }
        // return
    };

    const navigate = useNavigate();
    const location = useLocation();
    

    useEffect(() => {
        console.log('buttos useEffect')
       buttons()
    }, []);

    
    useEffect(() => {
        planMessage();
    }, []);

    const routes = {
        'Отчёт 0 часов': "/ShiftRep",
        'Остатки': "/ResForm",
        'Счётчики КМ': "/CoffeCounts",
        "Газовые баллоны": "/GasForm",
        "Остатки кафе": "/CafeRems",
        "Ингредиенты для хот-догов": "/HotDog",
        "Заявки по магазину": "/ShopOrders",
        "Ингредиенты КМ": "/CoffeIngs",
        "Приём НП": "/FuelIntake"
    }

    const { tg, queryId } = useTelegram();

    const [sentVisible, setSentVisible] = useState(false);

   

    console.log('navi:', location.state)

    useEffect(() => {
        // if (navigate.state && navigate.state.sent == true) {
        if (location.state && location.state.sent == true) {

            setSentVisible(true);

            const timer = setTimeout(() => {
                setSentVisible(false);
                navigate('/', {
                    replace: true,
                    state: { sent: false }
                })
                console.log('navi2:', location.state)
            }, 3000); // 3 секунды

            return () => clearTimeout(timer); // Очистка таймера при размонтировании

        }
    }, [location]);



    const handleClick = (path) => {
        navigate(routes[path]);
    }


    return (
        <div className={'list'} >
            {sentVisible && <h2 className={styles.sent}>{'Отправлено'}</h2>}
            {(Plandata && <div className={styles.plan}>{Plandata}</div>)}
            {data.map(item => (<button className={styles.btn} onClick={(v) => handleClick(item.action)}  >  {item.action} </button>))}
        </div>
    );
}

export default ButtonList;