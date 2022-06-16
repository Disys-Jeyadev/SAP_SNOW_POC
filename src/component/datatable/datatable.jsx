import React, { useEffect, useState } from "react";
import { Col, Input, Label, List, Row, Spinner, Progress, Modal, ModalBody, Button, ModalHeader, ModalFooter } from 'reactstrap';
import axios from 'axios';
import "./datatable.css";
import TransferModal from "../transfredmodal/transfredmodal";
import env from '../../env';
const DataTable = (props) => {
    const {
        dataTableSAP,
        selectAll,
        selectAllData,
        setSelectAll,
        selectSapData,
        isView,
        isTable,
        loadingData,
        openUplaodedTables
    } = props;
    const [filteredData, setFilteredData] = useState(dataTableSAP);
    const [loading, setLoading] = useState(false);
    const [loadingDone, setLoadingDone] = useState(false);
    const [confimration, setConfimration] = useState(false);
    const [confimrationModal, setConfimrationModal] = useState(false);
    const [snowFlakedata, setSnowFlakedata] = useState([]);
    const [uploadedTables, setUploadedTables] = useState([]);
    const [searchText, setSearchText] = useState('');
    const filterSAPData = (e) => {
        if (e.target.value.length > 3)
            setFilteredData(dataTableSAP.filter(x => (x.name.toLowerCase()).includes(e.target.value.toLowerCase())))
        else if (e.target.value.length === 0) {
            setFilteredData(dataTableSAP);
        }
    }
    useEffect(() => {
        setFilteredData(dataTableSAP)
    }, [dataTableSAP, loadingData])
    useEffect(() => {
        setFilteredData(filteredData)
    }, [filteredData])

    useEffect(() => {
        setSnowFlakedata([]);
    }, [isView, isTable])

    const openNewModal = () => {
        setLoadingDone(true)
    }

    const selectAllDataNew = (e) => {
        filteredData.forEach(value => {
            value.checked = e.target.checked;
        })
        setFilteredData(filteredData);
    }

    useEffect(()=>{
        if(confimration){
            setLoading(true)
        }
    },[confimration])


    const uploadTable = (data) => { 
        axios.post(`${env}/TableSubmit`, data).then(res => {
            setUploadedTables(res.data);
            setLoading(false);
            setConfimration(false);
            setLoadingDone(true)
        }).catch(err => {
            // setSnowFlakedata([]);
            setLoading(false);
            setConfimration(false);
        })
    }

    const uploadView = (data) => {
        setLoading(true);
        axios.post(`${env}/ViewSubmit`, data).then(res => {
            setUploadedTables(res.data);
            setLoading(false);
            setConfimration(false);
            setLoadingDone(true)
        }).catch(err => {
            setLoading(false);
            setConfimration(false);
        })
    }


    const uploadData = () => {
        setConfimration(true);
        setConfimrationModal(false);
        const data = [];
        snowFlakedata.forEach(x => data.push(x.name));
        if (isView) {
            uploadView(data);
        } else {
            uploadTable(data);
        }
    }

    const pushDataToSnowFlak = () => {
        const data = [];
        filteredData.forEach(x => x.checked ? data.push({ name: x.name, checked: false }) : '');
        setSnowFlakedata(data);
        // setFilteredData(filteredData.filter(x=> !x.checked));
        // setSelectAll(false);
    }

    const pushDataToSAP = () => {
        // snowFlakedata.forEach(x=>{
        //     if(x.checked){
        //      filteredData.push({name: x.name, checked: false})     
        //     }
        // })
        setSnowFlakedata(snowFlakedata.filter(x => !x.checked))
        // setFilteredData(filteredData);
        // setSelectAll(false);
    }

    const removeSnoflakTable = (name) => {
        setSnowFlakedata(snowFlakedata.filter(x => x !== name));
        setFilteredData(filteredData.map(x => {
            if (x.name === name) {
                x.checked = false
            }
            return x;
        }))
    }

    const selectSnowFlakData = (e) => {
        const d = snowFlakedata.map(x => {
            if (x.name === e.target.value) {
                x.checked = e.target.checked;
            }
            return x;
        });
        setSnowFlakedata(d);
    }

    return (
        <Row className='data-table-body'>
            <Col xs="5">
                <div className='list-body'>
                    <div className='list-header'>
                        <span>
                            <img src="sap.png" alt="sap" className="img-width" />
                        </span>
                        SAP HANA
                    </div>
                    <List type='unstyled' className='list-body-inner'>
                        {isTable === undefined && isView === undefined ? '' : <Input type="text" onChange={(e) => filterSAPData(e)} />}
                        {
                            isTable === undefined && isView === undefined ? 'Select view or table' : dataTableSAP.length > 0 ?
                                <li>
                                    <Input type="checkbox" key="selectAll" checked={selectAll} value={'selectAll'} onChange={(e) => {
                                        console.log(e.target.checked);
                                        selectAllDataNew(e)
                                        setSelectAll(e.target.checked)
                                    }} />
                                    <Label className='datatable-checkbox' check>
                                        Select All
                                    </Label>
                                </li> : <li className="loading-spinner">{loadingData ? <Spinner /> : ''}</li>
                        }
                        {
                            filteredData.map((view) => {
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

                <div className='arrow-data-table view-text' onClick={() => { pushDataToSnowFlak() }} >
                    <img src='arow.png' className='arrow-image' alt='no-imag' />
                </div>
                <div className='arrow-data-table1 view-text' onClick={() => { pushDataToSAP() }} >
                    <img src='arow.png' className='arrow-image' alt='no-imag' />
                </div>
            </Col>
            <Col xs="5" className="uploadbutton">
                <div className='list-body'>
                    <div className='list-header'>
                        <span>
                            <img src="hana.png" alt="hana" className="img-width" />
                        </span>
                        SELECTED OBJECTS
                    </div>
                    <List type='unstyled' className='list-body-inner text-left'>
                        {
                            snowFlakedata.length > 0 ? snowFlakedata.map((x) => <li>
                                <Input
                                    type="checkbox"
                                    checked={x.checked}
                                    key={x.name}
                                    value={x.name}
                                    onChange={(e) => selectSnowFlakData(e)} />
                                <Label className='datatable-checkbox' check>
                                    {x.name}
                                </Label>
                            </li>) : 'No Data'
                        }
                    </List>
                </div>
                <Button onClick={() => setConfimrationModal(true)} type="button" className="btn btn-success uploadbutton" disabled={loading} >Submit</Button>
            </Col>
            <Modal
                toggle={() => {
                    setLoading(false)
                    setLoadingDone(false)
                }}
                isOpen={loading}
                onClosed={openNewModal}
            >
                <ModalBody>
                    <div className='text-center'>
                        <br />
                        DB MIGRATION
                        <br />
                        <br />
                        <br />
                        <br />
                    </div>
                    <div className='row'>
                        <span className='float-left'>
                            SAP HANA
                        </span>
                        <div className='col-12'>
                            <Progress
                                animated
                                color="success"
                                value="25"
                            />
                        </div>
                        <span className='float-right'>
                            SNOW FLAKE
                        </span>
                    </div>
                </ModalBody>
            </Modal>
            <TransferModal isOpen={loadingDone} data={uploadedTables} openUplaodedTables={openUplaodedTables} />
            <Modal
                isOpen={confimrationModal}
            >
                <ModalHeader toggle={()=>{setConfimrationModal(false)}}>
                    User Selected Views/Tables
                </ModalHeader>
                <ModalBody>
                    <input type="text" placeholder="serach" onChange={(e)=>{
                        setSearchText(e.target.value)
                    }} />
                    <br/>
                    {
                        snowFlakedata.length > 0 && snowFlakedata.filter(x=>{
                            if(x.checked && searchText === ''){
                                return x;
                            }else if(x.checked && x.name.toLowerCase().includes(searchText.toLowerCase())){
                                return x;
                            }
                        }).map((x ,i)=>{                            
                            if(x.checked)
                            {
                                return(
                                    <div><span></span>  {x.name}</div>
                                )
                            }
                            return("");
                        })
                    }
                </ModalBody>
                <ModalFooter>
                    Do you want to upload ?
                    <Button
                        color="primary"
                        onClick={()=>uploadData()}
                    >
                        Yes
                    </Button>
                    {' '}
                    <Button onClick={()=>{
                        setConfimration(false);
                        setConfimrationModal(false);
                    }}>
                        No
                    </Button>
                </ModalFooter>
            </Modal>
        </Row>
    )
}

export default DataTable;