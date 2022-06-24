import React, { useEffect, useState } from "react";
import { List, Modal, ModalBody, Collapse, ModalHeader, Button } from 'reactstrap';
import './transfredmodal.css';

const TransferModal = (props) => {
    const {
        isOpen,
        data,
        openUplaodedTables
    } = props;
    const [table, setTable] = useState(false);
    const [open, setOpen] = useState(isOpen);
    const [tables, setTables] = useState(['test']);
    useEffect(() => {
        setOpen(isOpen)
    }, [isOpen]);

    const showData = (name) => {
        //load table data
        setOpen(true);
    }

    return (
        <div>
            {/* <div className="row">
                User Selected Tables
                <List>
                    {
                        tables.map(x => <li>{x} <Button onClick={() => { showData(x) }} /></li>)
                    }
                </List>
            </div> */}
            <Modal
                isOpen={open}
                toggle={() => setOpen(false)}
                size="lg"
            >
                <ModalHeader className="panel-heading" toggle={() => setOpen(false)}>
                    DB Migration data transfer
                </ModalHeader>
                <ModalBody className="tranfer-modal-body">
                    <div className='text-center'>
                        <br />
                    </div>
                    <div className='view-text-1'>
                        {
                            data && data.length > 0 ? data.map(x=><div>
                                <div>Table Name:<strong>{x.TableName}</strong> </div>
                                <div>Data Count: <strong>{x.Count}</strong></div>
                                <hr/>
                            </div>) : ''
                        }
                    </div>
                    <div>
                        <p className='view-text' onClick={() => {
                            setTable(!table)
                            openUplaodedTables(data)
                        }}>
                            Data Structure - View Table
                        </p>
                        <hr />

                        {/* <Collapse isOpen={table}>
                            <List type='unstyled' className='text-left-viewitem'>
                                No Data
                            </List>
                        </Collapse> */}
                    </div>
                </ModalBody>
            </Modal>
        </div>
    )
}

export default TransferModal;