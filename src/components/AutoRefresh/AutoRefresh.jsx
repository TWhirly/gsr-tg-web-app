import React, { useEffect } from 'react';

const AutoRefresh = () => {
  useEffect(() => {
    const checkForNewDay = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(0, 0, 0, 0); // Устанавливаем время на полночь

      // Проверяем, если сейчас новый день
      if (now.getTime() < midnight.getTime()) {
        window.location.reload();
        console.log('refresh') // Обновляем страницу
      }
    };

    // Проверяем каждые 60 секунд
    const intervalId = setInterval(checkForNewDay, 60000);

    // Очищаем интервал при размонтировании компонента
    return () => clearInterval(intervalId);
  }, []);

  return null; // Компонент ничего не рендерит
};

export default AutoRefresh;
