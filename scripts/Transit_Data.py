#Import Data mining tools
import pandas as pd
import sklearn
import numpy as np

#import data in csv
transit_data = pd.read_csv(r"C:\Users\Jay Barnett\Documents\Projects\_capstone\niner-transit-data\Testdata.csv", parse_dates=['Date'])
transit_data2 = pd.read_csv(r"C:\Users\Jay Barnett\Documents\Projects\_capstone\niner-transit-data\Testdata2.csv", parse_dates=['Date'])
transit_data3 = pd.read_csv(r"C:\Users\Jay Barnett\Documents\Projects\_capstone\niner-transit-data\Testdata3.csv", parse_dates=['Date'])

transit_data.dropna()
transit_data2.dropna()
df = pd.DataFrame(transit_data)
df2 = pd.DataFrame(transit_data2)
df3 = pd.DataFrame(transit_data3)
df_join = df.append(df2,ignore_index=True)
df_all = df_join.append(df_join, ignore_index=True)
#Show routes
routes_td1= transit_data[['Route', "Stop"]]
df_td1 = pd.DataFrame(routes_td1)

stops = pd.DataFrame(transit_data[["Stop", "Latitude" , "Longitude"]])
buses = pd.DataFrame(transit_data[["Bus", "Route"]])


print("//////////////////////////////////////////////////////////////////////////////////////////////////////////////")
#Show stop of Silver
print("-------------------- Most Stopped Silver routes ------------------------")
silver = df_all.loc[df_all['Route'] == 'Silver']
print(silver['Stop'].value_counts())
print(silver.head(50))

print("-------------------- Most Stopped Green routes ------------------------")
#Show stops of Green
green = df_all.loc[df_all['Route'] == 'Green'] 
print(green['Stop'].value_counts())
#print(green.head(30))

print("-------------------- Most Stopped Gold routes ------------------------")
#Show stops of Gold
gold = df_all.loc[df_all['Route'] == 'Gold']
print(gold['Stop'].value_counts())
#print(gold.head(30))


print("---------------------- Most Used Stop -------------------------")
print(df_all['Stop'].value_counts())

print("------------------- Most popular use of bus ----------------------")
print(df_all['Route'].value_counts())

print("------------------------------- Bus Id ----------------------------------")
print(df_all['Bus'].value_counts())

print("--------------------------------------")
print(df_all.group_by(["Bus","Date"]))