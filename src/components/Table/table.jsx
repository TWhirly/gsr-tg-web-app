import React, { useCallback, useEffect, useState } from 'react';
import { Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';
import './table.css';

const { tg } = useTelegram();

const TableTest = () => {
    return (
        <div className={"table"}>
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
    )
}

export default TableTest;