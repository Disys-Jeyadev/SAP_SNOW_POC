import React, { useEffect, useState } from "react";
import { List, Modal, ModalBody, Collapse, ModalHeader, Button, Table } from 'reactstrap';
import axios from "axios";
import env from '../../env'
import './usertables.css';
import ReactPaginate from "react-paginate";
// import { AgGridReact } from 'ag-grid-react';
// import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'; // Optional theme CSS
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
    const [currentItems, setCurrentItems] = useState(null);
    const [pageCount, setPageCount] = useState(10);
    const [itemOffset, setItemOffset] = useState(0);
    const itemsPerPage = 10;
    const [modalData, setModalData] = useState([]);
    const [modalData1, setModalData1] = useState([]);
    const [noData, setNodata] = useState('Select Table');
    const [selectedindex, setSelectedindex] = useState(-1);
    useEffect(() => {
        // Fetch items from another resources.
        const endOffset = itemOffset + itemsPerPage;
        console.log(`Loading items from ${itemOffset} to ${endOffset}`);
        setModalData(modalData1.slice(itemOffset, endOffset));
        setPageCount(Math.ceil(modalData1.length / itemsPerPage));
    }, [itemOffset, itemsPerPage]);
    useEffect(() => {
        setOpen(isOpen)
        setTables(data);
        setTable(data);
    }, [isOpen, data]);

    const showData = (name, selected) => {
        //load table data
        setNodata('No Data');
        showModalData(name);
        setOpen(true);
        setSelectedindex(selected);
    }

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % modalData1.length;
        setItemOffset(newOffset);
    };

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
        const endOffset = itemOffset + itemsPerPage;
        axios.post(`${env}/SnowflakeTableData`, [name]).then(res => {
            setModalData1(res.data);
            setModalData((res.data).slice(itemOffset, endOffset));
            setPageCount(Math.ceil(res.data.length / itemsPerPage))
            setLoader(false);
        })
            .catch(err => {
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
        for (let i = 0; i < tableRows; i++) {
            Object.keys(modalData).map(x =>
                columns.push(getColumn(modalData[x][i]))
            )
            rows.push(getRows(columns));
        }
        return rows;
    }

    return (
        <div>
            <h4><span className="f-left"><Button className="button" onClick={() => goback()} >Back</Button></span>New Migrated Objects [Snowflake]</h4>
            <div className="text-left">
                    
            </div>
            <hr/>
            <div className="row mt-4">
                <div className="col-4">                    
                    <br />                    
                    <List type="unstyled" className=" userlist text-left">
                        {
                            tables.map((x, i )=> { return (<li><p className={i === selectedindex ? 'selected-table' : ''} onClick={()=>showData(x.TableName , i)}><Button className="btn btn-primary btn-custom"><span className="tableName-span">{x.TableName}</span></Button></p></li>) })
                        }
                    </List>
                </div>

                <div className="col-8">                    
                {/* <br /> */}
                {loader ? 'Loading Data' :<div className="migratedTable"> <Table
                    >
                       {modalData && modalData.length > 0 && <thead>
                            <tr>
                                {
                                    Object.keys(modalData && modalData.length > 0 ? modalData[0] : []).map(x => <th>
                                        {x}
                                    </th>)
                                }
                            </tr>
                        </thead>}
                        <tbody>
                            {
                                modalData && modalData.length > 0 ? modalData.map((x, i) => <tr>
                                    {
                                        Object.keys(x).map(y => <td>{modalData[i][y]}</td>)
                                    }
                                </tr>) : noData
                            }
                        </tbody>
                    </Table>
                    </div>
                    }
                    <br />
                    {/* <br />
                    <br /> */}
                    {
                        !loader && <ReactPaginate
                        breakLabel="..."
                        nextLabel="next >"
                        onPageChange={handlePageClick}
                        pageRangeDisplayed={5}
                        pageCount={pageCount}
                        previousLabel="< previous"
                        renderOnZeroPageCount={null}
                        className="pagination"
                    />
                    }
                    {/* <br />
                    <br />
                    <br /> */}
                </div>


            </div>
            <Modal
                isOpen={false}
                toggle={() => setOpen(false)}
                fullscreen="xl"
                size="xl"
            >
                <ModalHeader toggle={() => setOpen(false)}>

                </ModalHeader>
                <ModalBody className="modal-body-user">
                    
                </ModalBody>
            </Modal>
        </div>
    )
}

export default UserTables;