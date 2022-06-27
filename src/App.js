import React, { useEffect, useState } from 'react';
import './App.css';
import { Col, Container, Input, Label, Row } from 'reactstrap';
import tableData from './stubdata/table.json';
import viewData from './stubdata/view.json';
import DataTable from './component/datatable/datatable';
import axios from 'axios';
import env from './env';
import UserTables from './component/usertables/usertables';
let counterFetch = 0;
function App() {
  const [view, setView] = useState();
  const [cview, setCView] = useState();
  const [table, setTable] = useState();
  const [object, setObject] = useState(true);
  const [counter, setCounter] = useState(0);
  // const [counterFetch, setCounterFetch] = useState(0);
  const [dataTableSAP, setDataTableSAP] = useState([]);
  const [loading, setLoading] = useState();
  const [serverdataTableSAP, setServerDataTableSAP] = useState({
    view: [],
    table: [],
    cview: []
  });
  const [selectAll, setSelectAll] = useState(false);
  const [uplaodedTables, setuplaodedTables] = useState([{
    name: 'test',
    count: 100,
    uploaded: true
  }]);
  const dataMapper = (data) => {
    let mappedData = [];
    if (data && data.length > 0) {
      mappedData = data.map(x => {
        return {
          name: x,
          checked: false
        }
      })
    }
    return mappedData;
  }
  useEffect(() => {
    fetchData();
    counterFetch = counterFetch + 1;

  }, [])

  const fetchData = () => {
    if (counterFetch > 0) {
      return;
    }
    setLoading(true);
    //fetch data
    axios.get(`${env}/view`).then(res => {
      // setServerDataTableSAP(Object.assign(serverdataTableSAP, { view: dataMapper(res.data) }));
      setServerDataTableSAP(Object.assign(serverdataTableSAP, { view: dataMapper(viewData) }));
      setLoading(false);
    }).catch(err => {
      // setDataTableSAP(dataMapper(viewData))
      setServerDataTableSAP(Object.assign(serverdataTableSAP, { view: dataMapper(viewData) }));
      setLoading(false);
    })
    axios.get(`${env}/Table`).then(res => {
      setServerDataTableSAP(Object.assign(serverdataTableSAP, { table: dataMapper(res.data) }));
      setLoading(false);
    }).catch(err => {
      // setServerDataTableSAP(Object.assign(serverdataTableSAP, { table: dataMapper(tableData) }));
      setLoading(false);
    })
    axios.get(`${env}/CalcView`).then(res => {
      setServerDataTableSAP(Object.assign(serverdataTableSAP, { cview: dataMapper(res.data) }));
      setLoading(false);
    }).catch(err => {
      // setServerDataTableSAP(Object.assign(serverdataTableSAP, { table: dataMapper(tableData) }));
      setServerDataTableSAP(Object.assign(serverdataTableSAP, { cview: [{ checked: false, 'name': "test" }] }));
      setLoading(false);
    })
  }
  useEffect(() => {
    if (view) {
      let _view = serverdataTableSAP.view;
      _view.forEach(x => x.checked = false);
      setDataTableSAP(serverdataTableSAP.view);
    }
    if (cview) {
      let _view = serverdataTableSAP.cview;
      _view.forEach(x => x.checked = false);
      setDataTableSAP(serverdataTableSAP.cview);
    }
    if (table) {
      let _view = serverdataTableSAP.table;
      _view.forEach(x => x.checked = false);
      setDataTableSAP(serverdataTableSAP.table)
    }
    setSelectAll(false);
  }, [view, table, serverdataTableSAP, loading, cview]);


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

  const openUplaodedTables = (data) => {
    setObject(false);
    setuplaodedTables(data);
  }

  const goback = () => {
    setObject(true);
  }

  return (
    <div className="App">
      <Container className='main-container'>
        <Row className='top-row'>
          <Col xs="2">
            <div className='db-logo'>
              <img src='snowflak-sap.png' alt='db-logo' />
            </div>
          </Col>
          <Col xs="9" className='header-col'>
            <h3 className='db-logo-text'>
              Disys DB Migration Assistant
            </h3>
          </Col>
          <Col xs="1" className='header-col'>
            <img src='dysis.png' alt='logo' className='ds-logo' />
            <br/>
            <br/>
          </Col>
        </Row>
        {/* <Row>
          <Col xs="2">
          </Col>
          <Col xs="10">

          </Col>
        </Row> */}
        <Row>
          {/* <Col xs="2">
          </Col> */}

          <Col xs="12">
            <Row>
              <Col xs="3">
                <div className="panel" onClick={() => { setObject(true) }} >
                  <h4 className='panel-heading upper'> Source Database</h4>
                  <div className='panel-body'>
                    <span>
                      <img src="sap.png" alt="sap" className="img-width" />
                    </span>
                    SAP HANA
                  </div>
                </div>
                <div className="panel" onClick={() => { setObject(true) }} >
                  <h4 className='panel-heading upper'> Target Database</h4>
                  <div className='panel-body'>
                    <span>
                      <img src="hana.png" alt="hana" className="img-width" />
                    </span>
                    SNOWFLAKE
                  </div>
                </div>
              </Col>
              <Col xs="9" className='header-col'>
                <div className={object && 'panel-heading-new'}>
                  {
                    object && <div className='object-selection-new'>
                      <h5 className='text-left upper' >Select Object For Migration</h5>
                      <div className='objets-sources'>
                        <div>
                          <Input
                            name="radio1"
                            type="radio"
                            checked={false}
                            // disabled={loading ? true : false}
                            onChange={() => {
                            }}
                          />
                          {' '}
                          <Label check>
                            Select All
                          </Label>
                        </div>
                        <div className='break'></div>
                        <div>
                          <Input
                            name="radio1"
                            type="radio"
                            checked={table}
                            // disabled={loading ? true : false}
                            onChange={() => {
                              setTable(true)
                              setView(false)
                              setCView(false)
                            }}
                          />
                          {' '}
                          <Label check className={`${table === true ? 'selected' : ''}`}>
                            Table
                          </Label>
                        </div>
                        <div className='break'></div>
                        <div>
                          <Input
                            name="radio1"
                            type="radio"
                            checked={view}
                            // disabled={loading ? true : false}                  
                            onChange={() => {
                              setView(true)
                              setTable(false)
                              setCView(false)
                            }}
                          />
                          {' '}
                          <Label check className={`${view === true ? 'selected' : ''}`} >
                            View
                          </Label>
                        </div>
                        <div className='break'></div>
                        <div>
                          <Input
                            name="radio1"
                            type="radio"
                            checked={cview}
                            // disabled={loading ? true : false}
                            onChange={() => {
                              setTable(false)
                              setView(false)
                              setCView(true)
                            }}
                          />
                          {' '}
                          <Label check className={`${cview === true ? 'selected' : ''}`}>
                            Calculated View
                          </Label>
                        </div>
                      </div>
                    </div>
                  }
                </div>
                {object && <DataTable
                  dataTableSAP={dataTableSAP}
                  selectAll={selectAll}
                  selectAllData={selectAllData}
                  setSelectAll={setSelectAll}
                  selectSapData={selectSapData}
                  isView={view}
                  isTable={table}
                  isCView={cview}
                  loadingData={loading}
                  openUplaodedTables={openUplaodedTables}
                />}
                {!object && <UserTables data={uplaodedTables} goback={goback} />}
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
