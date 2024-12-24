import React, { useState, useEffect } from 'react';
import styles from './intField.module.css'

const IntField = ({fieldStyle, inputStyle, buttonStyle, id, name, max, val, onChange, maxLength, incStep}) =>{

    const [value, setValue] = useState(val)

    useEffect = (() => {
        setValue(value)
    }, [value])

    const handleChange = (e) => {
        const id = e.target.id
        const key = e.target.name
        onChange(id, key)
    }

    const handleStep = (d) => {
        setValue(value + d)
    }

    // console.log(value)

    return ( 
    <div className={styles.inputline}>
        <input
            className={styles.input}
            id={id}
            name={name}
            value={value.toString().replace('.', ',')}
            max={max}
            type='text'
            inputMode='numeric'
            min={0}
            onChange={handleChange}
            maxLength={maxLength}
            // onFocus={clearOnFocus}
            // onBlur={handleBlurH}
             />
        <button className={styles.button}
            id={id}
            name={name}
            tabIndex="-1"
            value={value.toString().replace('.', ',')} onClick={(e) => handleStep(-incStep)}>&minus;</button>
        <button className={styles.button}
            id={id}
            name={name}
            tabIndex="-1"
            value={value.toString().replace('.', ',')} onClick={(e) => handleStep(incStep)}>+</button>
    </div>)
}

export default IntField