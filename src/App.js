import React, { useEffect, useState } from 'react';
import './App.css';
import { Col, Collapse, Container, List, Modal, ModalBody, Progress, Row } from 'reactstrap';
import data from './stubdata/test.json'
import DataTable from './component/datatable/datatable';

function App() {
  const [view, setView] = useState(false);
  const [table, setTable] = useState(false);
  const [counter, setCounter] = useState(0);
  const [dataTableSAP, setDataTableSAP] = useState([]);
  // const [dataTableSnowFlak, setdataTableSnowFlak] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  // const [selectedSAPData, setSelectedSAPData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDone, setLoadingDone] = useState(false);
  useEffect(() => {
    if (view) {
      let _view = data.table;
      _view.forEach(x => x.checked = false);
      setDataTableSAP(data.view);
    }
    if (table) {
      let _view = data.view;
      _view.forEach(x => x.checked = false);
      setDataTableSAP(data.table)
    }
    setSelectAll(false);
  }, [view, table]);

  const uploadData = () => {
    setLoading(true)
  }

  const openNewModal = () => {
    setLoadingDone(true)
    setCounter(counter+1);
  }

  const selectAllData = (e) => {
    dataTableSAP.forEach(value => {
      value.checked = e.target.checked;
    })
    setDataTableSAP(dataTableSAP);
    console.log(dataTableSAP);
  }

  const selectSapData = (e) => {
    let _dataTableSAP = dataTableSAP;
    _dataTableSAP.forEach((val) => {
      if (val.name === e.target.value) {
        val.checked = e.target.checked;
      }
    })
    setCounter(counter + 1);
    setDataTableSAP(_dataTableSAP);
    console.log(_dataTableSAP);
  }

  return (
    <div className="App">
      <Container>
        <Row>
          <Col className='left-conatiner' xs="3">
            <div className="view">
              <div>
                <p className='view-text' onClick={() => {
                  setView(true)
                  setTable(false)
                }}>
                  View
                </p>
                <Collapse isOpen={view}>
                  <List type='unstyled' className='text-left-viewitem'>
                    {
                      data.view.map((view) => <li>{view.name}</li>)
                    }
                  </List>
                </Collapse>
              </div>
              <div>
                <p className='view-text' onClick={() => {
                  setTable(true)
                  setView(false)
                }}>
                  Table
                </p>
                <Collapse isOpen={table}>
                  <List type='unstyled' className='text-left-viewitem'>
                    {
                      data.table.map((view) => <li>{view.name}</li>)
                    }
                  </List>
                </Collapse>
              </div>
            </div>
          </Col>
          <Col xs="9">
            <div className='app-header text-center'>
              <span className='logo-text'>DB MIGRATION</span>
            </div>
            <DataTable
              uploadData={uploadData}
              dataTableSAP={dataTableSAP}
              selectAll={selectAll}
              selectAllData={selectAllData}
              setSelectAll={setSelectAll}
              selectSapData={selectSapData}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
