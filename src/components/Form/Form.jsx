import React, { useCallback, useEffect, useState } from 'react';
import './Form.css';
import '../Table/table.css'
import { useTelegram } from "../../hooks/useTelegram";
import { NumberField, Label, Group, Input, Button, Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';
// import { Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';

const Form = () => {
    const [country, setCountry] = useState('');
    const [street, setStreet] = useState('');
    const [subject, setSubject] = useState('physical');
    const { tg } = useTelegram();

    const onSendData = useCallback(() => {
        const data = {
            country,
            street,
            subject
        }
        tg.sendData(JSON.stringify(data));
    }, [country, street, subject, tg])

    useEffect(() => {
        tg.onEvent('mainButtonClicked', onSendData)
        return () => {
            tg.offEvent('mainButtonClicked', onSendData)
        }
    }, [onSendData, tg])

    useEffect(() => {
        tg.MainButton.setParams({
            text: 'Отправить данные'
        })
    }, [tg.MainButton])

    useEffect(() => {
        if (!street || !country) {
            tg.MainButton.hide();
        } else {
            tg.MainButton.show();
        }
    }, [country, street, tg.MainButton])

    const onChangeCountry = (e) => {
        setCountry(e.target.value)
    }

    const onChangeStreet = (e) => {
        setStreet(e.target.value)
    }

    const onChangeSubject = (e) => {
        setSubject(e.target.value)
    }

    return (
        <div className={"form"}>
            <h5 style={{ backgroundColor: "lightblue" }}>Введите ваши данные</h5>
            <input
                className={'input'}
                type="text"
                placeholder={'Страна'}
                value={country}
                onChange={onChangeCountry}
            />
            <NumberField defaultValue={1024} minValue={0}>
                <Label>Width</Label>
                <Group>
                    <Button slot="decrement">-</Button>
                    <Input />
                    <Button slot="increment">+</Button>
                </Group>
            </NumberField>
            <input
                className={'input'}
                type="text"
                placeholder={'Улица'}
                value={street}
                onChange={onChangeStreet}
            />
            <select value={subject} onChange={onChangeSubject} className={'select'}>
                <option value={'physical'}>Физ. лицо</option>
                <option value={'legal'}>Юр. лицо</option>
            </select>
            
            <Table aria-label="Files" >
                <TableHeader>

                    <Column>Type</Column>
                    <Column>Date Modified</Column>
                </TableHeader>
                <TableBody>
                    <Row>
                        <Cell>File folder</Cell>
                        <Cell>6/7/2020</Cell>
                    </Row>
                    <Row>

                        <Cell>File folder</Cell>
                        <Cell>4/7/2021</Cell>
                    </Row>
                    <Row>

                        <Cell>System file</Cell>
                        <Cell>11/20/2010</Cell>
                    </Row>
                    <Row>

                        <Cell>Text Document</Cell>
                        <Cell>1/18/2016</Cell>
                    </Row>
                </TableBody>
            </Table>
        </div>
    );
};

export default Form;