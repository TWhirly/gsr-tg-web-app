import React from "react";
import { useTelegram } from "../../hooks/useTelegram";

const Header = () => {
//      const tg = window.Telegram.WebApp;
//     const onClose = () => {
//         tg.close()
//     }

    const tg = useTelegram();
    const onClick = () => {
        tg.onClose1()
    }
    

    return (

        <div >
            <button className={'header'} onClick={onClick}>Закрыть</button>
            <span className={'username'}>
                {tg.initDataUnsafe?.user?.username}
            </span>


        </div>

    );
};

export default Header;