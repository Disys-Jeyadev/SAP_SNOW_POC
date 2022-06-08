
from flask import Flask, jsonify,render_template,url_for
from sqlalchemy import create_engine
import configparser
import pandas as pd
from hdbcli import dbapi
from flask import request
import json
import snowflake.connector
from snowflake.connector.pandas_tools import write_pandas
from snowflake.sqlalchemy import URL
app = Flask(__name__)
configFilePath = 'cred.ini'
cfg_parser = configparser.ConfigParser()

cfg_parser.read(configFilePath)
Address = cfg_parser.get('SAP', 'address')
Port = cfg_parser.get('SAP', 'port')
SAP_User = cfg_parser.get('SAP', 'user')
SAP_Password = cfg_parser.get('SAP', 'password')
CurrentSchema = cfg_parser.get('SAP', 'currentSchema')

conn = dbapi.connect(address=Address, port=Port, user=SAP_User,
                    password=SAP_Password, currentSchema=CurrentSchema)
cursor = conn.cursor()
warehouse = cfg_parser.get('snowflake', 'warehouse')
Account = cfg_parser.get('snowflake', 'account')
SNOW_User = cfg_parser.get('snowflake', 'user')
SNOW_Password = cfg_parser.get('snowflake', 'password')
Database = cfg_parser.get('snowflake', 'database')
Schema = cfg_parser.get('snowflake', 'Schema')
cnn = snowflake.connector.connect(
    user=SNOW_User,
    password=SNOW_Password,
    account=Account,
    warehouse=warehouse,
    database=Database,
    schema=Schema)
url = URL(
        user=SNOW_User,
        password=SNOW_Password,
        account=Account,
        warehouse=warehouse,
        database=Database,
        schema=Schema)
engine = create_engine(url)
connection = engine.connect()
#----------------url routing----------------
@app.route('/')
def home():
    return render_template('home.html',)
@app.route('/Table', methods=['GET'])
def Table():
    tablenamequery = f"Select TABLE_NAME from TABLES WHERE SCHEMA_NAME='{CurrentSchema}';"
    cursor.execute(tablenamequery)
    dbs = pd.DataFrame(cursor.fetchall())
    column_headers = [i[0] for i in cursor.description]
    dbs.columns = column_headers 
    Tableop = dbs['TABLE_NAME'].tolist()
    return jsonify(Tableop)
    
@app.route('/view', methods=['GET'])
def view():
    query = f"select * from sys.views where schema_name = '{CurrentSchema}';"
    cursor.execute(query)
    dftviewdata = pd.DataFrame(cursor.fetchall())
    column_headers = [i[0] for i in cursor.description]
    dftviewdata.columns = column_headers   
    op = dftviewdata['VIEW_NAME'].tolist()
    return jsonify(op)
@app.route('/TableSubmit', methods=['POST'])
def Data_Processing():
    tn = json.loads(request.data)
    temp = (len(tn))
    z= 0
    Output = []

    while z < temp:
    # SAP Query ---------------------------
        Queryinfo = f"SELECT COLUMN_NAME,DATA_TYPE_NAME,IS_NULLABLE,GENERATION_TYPE FROM SYS.TABLE_COLUMNS WHERE SCHEMA_NAME= '{CurrentSchema}' AND TABLE_NAME= '{tn[z]}' ORDER BY POSITION;"
        QueryPrimary = f"SELECT COLUMN_NAME,IS_PRIMARY_KEY,IS_UNIQUE_KEY FROM SYS.CONSTRAINTS WHERE SCHEMA_NAME = '{CurrentSchema}' and TABLE_NAME= '{tn[z]}';"
        export_data = f'SELECT * FROM "{CurrentSchema}"."{tn[z]}";'
    
        cursor.execute(Queryinfo)
        dfInfo = pd.DataFrame(cursor.fetchall(),columns=["COLUMN_NAME", "DATA_TYPE_NAME", "IS_NULLABLE", "GENERATION_TYPE"])
        cursor.execute(QueryPrimary)
        dfPrimary = pd.DataFrame(cursor.fetchall(), columns=["COLUMN_NAME", "IS_PRIMARY_KEY", "IS_UNIQUE_KEY"])
        cursor.execute(export_data)
        df_exported_data = pd.DataFrame(cursor.fetchall())
        column_headers = [i[0] for i in cursor.description]  # gets the column name.
        df_exported_data.columns = column_headers  # adds header to the data frame with the data
        Column_Name = list(dfInfo.iloc[0:, 0])
        Column_Data_Type = list(dfInfo.iloc[0:, 1])
        for k in range(len(Column_Data_Type)):
            Column_Data_Type[k] = Column_Data_Type[k].upper()
        try:
            Primary_Key = list(dfPrimary.iloc[0, :])
        except:
            Primary_Key = ''
        for i in range(len(Column_Data_Type)):
            if Column_Data_Type[i] == 'NVARCHAR':
                Column_Data_Type[i] = 'VARCHAR'
            if Column_Data_Type[i] == 'INTEGER':
                Column_Data_Type[i] = 'NUMERIC'
            if Column_Data_Type[i] == 'BLOB':
                Column_Data_Type[i] = 'BINARY'
            if Column_Data_Type[i] == 'CLOB':
                Column_Data_Type[i] = 'VARCHAR'
            if Column_Data_Type[i] == 'ST_GEOMETRY':
                Column_Data_Type[i] = 'VARCHAR'
            if Column_Data_Type[i] == 'ST_POINT':
                Column_Data_Type = 'VARCHAR'
        length = len(Column_Name)
        #print(Column_Name)
        data = ""
        #print(length)
        for j in range(length):
            if Column_Name[j] in Primary_Key and j < length - 1:
                data += f'{Column_Name[j]} {Column_Data_Type[j]}  Primary Key,'
            elif Column_Name[j] in Primary_Key and j == length:
                data += f'{Column_Name[j]} {Column_Data_Type[j]}  Primary Key'
            elif Column_Name[j] not in Primary_Key and j < length - 1:
                data += f'{Column_Name[j]} {Column_Data_Type[j]},'
            else:
                data += f'{Column_Name[j]} {Column_Data_Type[j]} '
        query = f'CREATE TABLE IF NOT EXISTS {tn[z]} ({data});'
        cnn.execute_string(query)
        success, nchunks, nrows, _ = write_pandas(cnn, df_exported_data, tn[z], quote_identifiers=False)
        Output.append(tn[z])
        if success == True:
            Output.append('True')
        else:
            Output.append('False')
        Output.append(str(nrows))
        
        z = z+1
  
    return jsonify(Output)
     

@app.route('/ViewSubmit', methods=['POST'])
def View_Processing():
    VN = json.loads(request.data)
    query = f"select VIEW_NAME,DEFINITION from sys.views where schema_name = '{CurrentSchema}';"
    cursor.execute(query)
    dftviewdata = pd.DataFrame(cursor.fetchall())
    column_headers = [i[0] for i in cursor.description]
    dftviewdata.columns = column_headers   
    voutput = []    
    for i in range(len(VN)):
        data = dftviewdata[dftviewdata['VIEW_NAME'] == VN[i]]# Gets the view name and the definition by comparing whether the user inputed viewname is there in the dataframe
        VIEW_NAME = (data['VIEW_NAME'].tolist())
        definition = (data['DEFINITION'].tolist())
        VIEW_NAME = ''.join(VIEW_NAME)
        definition = ''.join(definition)
        print(VIEW_NAME)
        #print(data)
        View_query = f'CREATE OR REPLACE VIEW {VIEW_NAME} as {definition};'
        View_query = View_query.upper()
        voutput.append(View_query)
    return jsonify(voutput)
            
@app.route('/TableResult')
def Table_Result():
    return render_template('result_table.html')
if __name__ == '__main__':
    app.run(debug=True)