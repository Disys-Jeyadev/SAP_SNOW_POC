import React, { useEffect, useState } from "react";
import { List, Modal, ModalBody, Collapse, ModalHeader, Button, Table } from 'reactstrap';
import axios from "axios";
import env from '../../env'
import './usertables.css';
const UserTables = (props) => {
    const {
        isOpen,
        data,
        goback
    } = props;
    const [table, setTable] = useState(false);
    const [open, setOpen] = useState(isOpen);
    const [tables, setTables] = useState(['loading']);
    const [view, setView] = useState([]);
    const [loader, setLoader] = useState(false);
    const [modalData, setModalData] = useState({
        DEPARTMENT_ALLOTED: ['test'],
        DOCTOR_ID: ['test'],
        DOCTOR_NAME: ['test'],
    });
    useEffect(() => {
        setOpen(isOpen)
        setTables(data);
        setTable(data);
    }, [isOpen, data]);

    const showData = (name) => {
        //load table data
        showModalData(name);
        setOpen(true);
    }

    // useEffect(() => {
    //     axios.get(`${env}/SnowflakeTable`).then(res => {
    //         setTables(res.data);
    //     }).catch(err => {
    //         setTable(['error']);
    //     })
    //     axios.get(`${env}/SnowflakeView`).then(res => {
    //         setView(res.data);
    //     }).catch(err => {
    //         setView(['error']);
    //     })
    // }, []);

    const showModalData = (name) => {
        setLoader(true);
        axios.post(`${env}/SnowflakeTableData`,[name]).then(res=>{
            setModalData(JSON.parse(res.data));
            setLoader(false);
        })
        .catch(err=>{
            setModalData([]);
            setLoader(false);
        })
    }

    const getColumn = (d) => <td>
            {d}
        </td>

    const getRows = (child) => <tr>{child}</tr>

    const getData = () => {
        let tableRows = 0;       
        Object.keys(modalData).map(x => {
            tableRows = modalData && modalData[x] ? modalData[x].length : 0;                    
        })
        const columns = [];
        const rows = []
        for(let i = 0 ; i < tableRows ; i++){
            Object.keys(modalData).map(x =>                
                    columns.push(getColumn(modalData[x][i]))
            )  
            rows.push(getRows(columns));
        }
        return rows;
    }

    return (
        <div>
            <div className="row mt-4">
                <div className="col-10">
                    <h4>Snowflake Tables</h4>
                    <hr />
                    <br />
                    <br />
                    <Button onClick={()=>goback()} >Back</Button>
                    <List type="unstyled" className=" userlist text-left">
                        {
                            tables.map(x => {return(<li><p>{x.TableName}</p> &nbsp; &nbsp; &nbsp;   <Button className="btn btn-secondary btn-sm" onClick={() => { showData(x.TableName) }}>ShowData</Button></li>)})
                        }
                    </List>
                </div>


            </div>
            <Modal
                isOpen={open}
                toggle={() => setOpen(false)}
                fullscreen="xl"
                size="lg"
            >
                <ModalHeader toggle={() => setOpen(false)}>

                </ModalHeader>
                <ModalBody className="modal-body-user">
                   {loader ? 'Loading Data' : <Table
                    >
                        <thead>
                            <tr>
                                {
                                    Object.keys(modalData && modalData.length > 0 ? modalData[0] : []).map(x => <th>
                                        {x}
                                    </th>)
                                }
                            </tr>
                        </thead>
                        <tbody>
                                {
                                    modalData && modalData.length > 0 ? modalData.map((x,i)=><tr>
                                        {
                                            Object.keys(x).map(y=><td>{modalData[i][y]}</td>)
                                        }
                                    </tr>) : 'No Data'
                                }
                        </tbody>
                    </Table>}
                </ModalBody>
            </Modal>
        </div>
    )
}

export default UserTables;