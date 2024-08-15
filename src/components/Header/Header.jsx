import React from "react";
import { useTelegram } from "../../hooks/useTelegram";
import { useLocation } from "react-router-dom";

const Header = () => {
//      const tg = window.Telegram.WebApp;
//     const onClose = () => {
//         tg.close()
//     }

    const tg = useTelegram();
    const onClick = () => {
        tg.onClose1()
    }

    const backButton = Telegram.WebApp.BackButton;

    // Показывать кнопку только если есть GET параметры 
// Показывать кнопку только если есть параметры 
// и страница не главная
// if (window.location.search && window.location.pathname !== '/menu') {
    if (useLocation().pathname !== '/') {

  backButton.show();

} else {

  backButton.hide(); 

}
backButton.onClick(() => {
      history.back();
    });
    

    return (

        <div >
            {/* <button className={'header'} onClick={onClick}>Закрыть</button>
            {useLocation().pathname} */}
            


        </div>

    );
};

export default Header;