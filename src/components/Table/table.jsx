import { Cell, Column, Row, Table, TableBody, TableHeader } from 'react-aria-components';

const TableTest = () => {
    return (
        <div className={"table"}>
            <Table aria-label="Files" selectionMode="multiple">
                <TableHeader>
                    <Column>
                        <MyCheckbox slot="selection" />
                    </Column>
                    <Column isRowHeader>Name</Column>
                    <Column>Type</Column>
                    <Column>Date Modified</Column>
                </TableHeader>
                <TableBody>
                    <Row>
                        <Cell>
                            <MyCheckbox slot="selection" />
                        </Cell>
                        <Cell>Games</Cell>
                        <Cell>File folder</Cell>
                        <Cell>6/7/2020</Cell>
                    </Row>
                    <Row>
                        <Cell>
                            <MyCheckbox slot="selection" />
                        </Cell>
                        <Cell>Program Files</Cell>
                        <Cell>File folder</Cell>
                        <Cell>4/7/2021</Cell>
                    </Row>
                    <Row>
                        <Cell>
                            <MyCheckbox slot="selection" />
                        </Cell>
                        <Cell>bootmgr</Cell>
                        <Cell>System file</Cell>
                        <Cell>11/20/2010</Cell>
                    </Row>
                    <Row>
                        <Cell>
                            <MyCheckbox slot="selection" />
                        </Cell>
                        <Cell>log.txt</Cell>
                        <Cell>Text Document</Cell>
                        <Cell>1/18/2016</Cell>
                    </Row>
                </TableBody>
            </Table>
        </div>
    )
}

export default TableTest;