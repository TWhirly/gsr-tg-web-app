import React, { createContext, useEffect, useState } from 'react';
import { localUrl } from './localSettings'
const APIURL = localUrl.APIURL;

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [stationId, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(APIURL + '/station', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({initData: window.Telegram.WebApp.initData })
                }); 
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const result = (await response.json())[0][0]['ID'];
                setData(result);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
            
        };

        fetchData();
    }, []);

    console.log('DataContext', stationId)

    return (
        <DataContext.Provider value={{ stationId, loading, error }}>
            {children}
        </DataContext.Provider>
    );
};

