from flask import Flask, jsonify,render_template,url_for
from flask_sqlalchemy import SQLAlchemy
import configparser
import pandas as pd
from hdbcli import dbapi
from requests import request
import json
import snowflake.connector
from snowflake.connector.pandas_tools import write_pandas
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
    Tableop =dbs['TABLE_NAME'].tolist()
    return jsonify(Tableop)
    
@app.route('/view', methods=['GET'])
def view():
    query = f"select * from sys.views where schema_name = '{CurrentSchema}';"
    cursor.execute(query)
    dftviewdata = pd.DataFrame(cursor.fetchall())
    column_headers = [i[0] for i in cursor.description]
    dftviewdata.columns = column_headers   
    Namedata = (dftviewdata['VIEW_NAME'])
    View_Name = Namedata.tolist()
    View_select_query = (dftviewdata[['VIEW_NAME','DEFINITION']])
    op = dftviewdata['VIEW_NAME'].tolist()
    return jsonify(op)
@app.route('/',methods=['POST'])
def Data_Processing():
    TN = request.form
    for I in range(len(TN)):
            # SAP Query ---------------------------
            Queryinfo = f"SELECT COLUMN_NAME,DATA_TYPE_NAME,IS_NULLABLE,GENERATION_TYPE FROM SYS.TABLE_COLUMNS WHERE SCHEMA_NAME='{CurrentSchema}' AND TABLE_NAME='{TN[I]}' ORDER BY POSITION;"
            QueryPrimary = F"SELECT COLUMN_NAME,IS_PRIMARY_KEY,IS_UNIQUE_KEY FROM SYS.CONSTRAINTS WHERE SCHEMA_NAME = '{CurrentSchema}' and TABLE_NAME='{TN[I]}';"
            export_data = f'SELECT * FROM "' + CurrentSchema + '"."' + TN[I] + '";'
            # ------------------------------------------------------------------------------
            cursor.execute(Queryinfo)
            dfInfo = pd.DataFrame(cursor.fetchall(),
                                columns=["COLUMN_NAME", "DATA_TYPE_NAME", "IS_NULLABLE", "GENERATION_TYPE"])
            cursor.execute(QueryPrimary)
            dfPrimary = pd.DataFrame(cursor.fetchall(), columns=["COLUMN_NAME", "IS_PRIMARY_KEY", "IS_UNIQUE_KEY"])
            cursor.execute(export_data)
            df_exported_data = pd.DataFrame(cursor.fetchall())
            column_headers = [i[0] for i in cursor.description]  # gets the column name.
            df_exported_data.columns = column_headers  # adds header to the data frame with the data
            Column_Name = list(dfInfo.iloc[0:, 0])
            Column_Data_Type = list(dfInfo.iloc[0:, 1])
            for i in range(len(Column_Data_Type)):
                Column_Data_Type[i] = Column_Data_Type[i].upper()
            try:
                Primary_Key = list(dfPrimary.iloc[0, :])
            except:
                Primary_Key = ''
            #st.write(Primary_Key)
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
            data = ""
            i = 0
            for i in range(length):
                if Column_Name[i] in Primary_Key and i < length - 1:
                    data += f'{Column_Name[i]} {Column_Data_Type[i]}  Primary Key,'
                elif Column_Name[i] in Primary_Key and i == length:
                    data += f'{Column_Name[i]} {Column_Data_Type[i]}  Primary Key'
                elif Column_Name[i] not in Primary_Key and i < length - 1:
                    data += f'{Column_Name[i]} {Column_Data_Type[i]},'
                else:
                    data += f'{Column_Name[i]} {Column_Data_Type[i]} '
            query = f'CREATE TABLE IF NOT EXISTS {TN} ({data});'
            for cs in cnn.execute_stream(query):
                for rt in cs:
                    print(rt)
            success, nchunks, nrows, _ = write_pandas(cnn, df_exported_data, TN, quote_identifiers=False)
@app.route('/TableResult')
def Table_Result():
    return render_template('result_table.html')
if __name__ == '__main__':
    app.run(debug=True)