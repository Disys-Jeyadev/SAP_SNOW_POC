import React from "react";
import { Col, Input, Label, List, Row } from 'reactstrap';
const DataTable = (props) => {
    const {
        uploadData,
        dataTableSAP,
        selectAll,
        selectAllData,
        setSelectAll,
        selectSapData
    } = props;

    return (
        <Row className='data-table-body'>
            <Col xs="5">
                <div className='list-body'>
                    <div className='list-header'>
                        SAP HANA
                    </div>
                    <List type='unstyled' className='list-body-inner'>
                        {
                            dataTableSAP.length > 0 ?
                                <li>
                                    <Input type="checkbox" key="selectAll" checked={selectAll} value={'selectAll'} onChange={(e) => {
                                        console.log(e.target.checked);
                                        selectAllData(e)
                                        setSelectAll(e.target.checked)
                                    }} />
                                    <Label className='datatable-checkbox' check>
                                        Select All
                                    </Label>
                                </li> : 'No Data'
                        }
                        {
                            dataTableSAP.map((view) => {
                                return (
                                    <li>
                                        <Input
                                            type="checkbox"
                                            checked={view.checked}
                                            key={view.name}
                                            value={view.name}
                                            onChange={(e) => selectSapData(e)} />
                                        <Label className='datatable-checkbox' check>
                                            {view.name}
                                        </Label>
                                    </li>
                                )
                            })
                        }
                    </List>
                </div>
            </Col>
            <Col xs="2">
                <div className='arrow-data-table view-text' onClick={() => { uploadData() }} >
                    <img src='arow.png' className='arrow-image' alt='no-imag' />
                </div>
            </Col>
            <Col xs="5">
                <div className='list-body'>
                    <div className='list-header'>
                        SNOW FLAKE
                    </div>
                    <List type='unstyled' className='list-body-inner text-left'>
                        <li>
                            table1
                        </li>
                    </List>
                </div>
            </Col>
        </Row>
    )
}

export default DataTable;