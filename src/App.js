import React, { useEffect, useState } from 'react';
import './App.css';
import { Col, Container, Input, Label, Row } from 'reactstrap';
import tableData from './stubdata/table.json';
import viewData from './stubdata/view.json';
import DataTable from './component/datatable/datatable';
import axios from 'axios';
import env from './env';
import UserTables from './component/usertables/usertables';

function App() {
  const [view, setView] = useState();
  const [table, setTable] = useState();
  const [object, setObject] = useState(true);
  const [counter, setCounter] = useState(0);
  const [dataTableSAP, setDataTableSAP] = useState([]);
  const [loading, setLoading] = useState();
  const [serverdataTableSAP, setServerDataTableSAP] = useState({
    view: [],
    table: []
  });
  const [selectAll, setSelectAll] = useState(false); 
  const [uplaodedTables, setuplaodedTables] = useState([{
    name: 'test',
    count: 100,
    uploaded : true
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
      setServerDataTableSAP(Object.assign(serverdataTableSAP,{table: dataMapper(res.data)}));
      setLoading(false);
    }).catch(err => {
      // setServerDataTableSAP(Object.assign(serverdataTableSAP, { table: dataMapper(tableData) }));
      setLoading(false);
    })
  }, [])
  useEffect(() => {
    if (view) {
      let _view = serverdataTableSAP.table;
      _view.forEach(x => x.checked = false);
      setDataTableSAP(serverdataTableSAP.view);
    }
    if (table) {
      let _view = serverdataTableSAP.view;
      _view.forEach(x => x.checked = false);
      setDataTableSAP(serverdataTableSAP.table)
    }
    setSelectAll(false);
  }, [view, table, serverdataTableSAP,loading]);


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

  const openUplaodedTables = (data)=>{
    setObject(false);
    setuplaodedTables(data);
  }

  const goback = () => {
    setObject(true);
  }

  return (
    <div className="App">
      <Container>
        <Row>
          <Col className='left-conatiner' xs="3">
            <div className="view" onClick={()=>{setObject(true)}} >
              <h5  >Objects</h5>
              <div>
                <Input
                  name="radio1"
                  type="radio"
                  // disabled={loading ? true : false}                  
                  onChange={() => {
                    setView(true)
                    setTable(false)
                  }}
                />
                {' '}
                <Label check className={`${view === true ? 'selected' : ''}`} >
                  View
                </Label>
              </div>
              <div>                
                <Input
                  name="radio1"
                  type="radio"
                  // disabled={loading ? true : false}
                  onChange={() => {
                    setTable(true)
                    setView(false)
                  }}
                />
                {' '}
                <Label check className={`${table === true ? 'selected' : ''}`}>
                  Table
                </Label>
              </div>              
            </div>
            {/* <h5 className='view1 pointer' onClick={()=>{setObject(false)}}>Show User Tables</h5> */}
          </Col>
          <Col xs="9">
            <div className='app-header text-center'>
              <img src='logo1.png' alt='' className='img-width' />
              <span className='logo-text'>  DB MIGRATION</span>
            </div>
            {object && <DataTable
              dataTableSAP={dataTableSAP}
              selectAll={selectAll}
              selectAllData={selectAllData}
              setSelectAll={setSelectAll}
              selectSapData={selectSapData}
              isView={view}
              isTable={table}
              loadingData={loading}
              openUplaodedTables={openUplaodedTables}
            />}
            {!object && <UserTables data={uplaodedTables} goback={goback} />}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
