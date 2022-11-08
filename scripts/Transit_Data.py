#Import Data mining tools
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import mysql.connector

import datetime
from collections import defaultdict


from sqlalchemy import Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

from pydantic import BaseModel

SQLALCHEMY_DB_URL = "mysql://datauser:datauser@localhost/transitninerlytics"
engine = create_engine(SQLALCHEMY_DB_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()




# DATABASE MODELS

class Bus(Base):
    __tablename__ = "bus"

    id = Column("busid", Integer, primary_key=True)
    code = Column("buscode", String, nullable=False)


class Route(Base):
    __tablename__ = "route"

    id = Column("routeid", Integer, primary_key=True)
    name = Column("name", String, nullable=False)


class Stop(Base):
    __tablename__ = "stop"

    id = Column("stopid", Integer, primary_key=True)
    name = Column("name", String, nullable=False)
    latitude = Column("latitude", Float, nullable=False)
    longitude = Column("longitude", Float, nullable=False)


class StopData(Base):
    __tablename__ = "stopdata"

    id = Column("stopdataid", Integer, primary_key=True)
    bus = Column("busid", Integer, ForeignKey("bus.busid"))
    route = Column("routeid", Integer, ForeignKey("route.routeid"))
    stop = Column("stopid", Integer, ForeignKey("stop.stopid"))
    timestamp = Column("timestamp", DateTime, nullable=False)
    num_people_on = Column("numpeopleon", Integer)
    num_people_off = Column("numpeopleoff", Integer)


# PYDANDIC SCHEMAS

class BusSchema(BaseModel):
    id: int
    code: str

    class Config:
        orm_mode = True


class RouteSchema(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True


class StopSchema(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float

    class Config:
        orm_mode = True


class StopDataSchema(BaseModel):
    id: int
    bus: int
    route: int
    stop: int
    timestamp: datetime.datetime
    num_people_on: int
    num_people_off: int

    class Config:
        orm_mode = True



def get_buses(db: Session):
    return db.query(Bus).all()

def get_routes(db: Session):
    return db.query(Route).all()

def get_stops(db: Session):
    return db.query(Stop).all()
    



def local_db_connection():
    db = SessionLocal()
    return db


import math

# distance between (lat, lng) points in km
def haversine(pt1, pt2):
    """
    Calculate the great circle distance in kilometers between two points 
    on the earth (specified in decimal degrees)
    """
    # convert decimal degrees to radians 
    lat1, lon1, lat2, lon2 = map(math.radians, [*pt1, *pt2])

    # haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a)) 
    r = 6372.8 # Radius of earth in kilometers. Use 3956 for miles. Determines return value units.
    return c * r




def main():
    db: Session = local_db_connection()
    return

    # buses = get_buses(db)
    # for bus in buses:
    #     print(bus.id, bus.code)

    # db.close()

    
    parse_args = dict(
        dtype={
            "Bus": str,
        }
    )

    # return
    #import data in csv
    # transit_data = pd.read_csv(r"data/Testdata.csv", **parse_args)
    transit_data2 = pd.read_csv(r"data/Testdata2.csv", **parse_args)
    transit_data3 = pd.read_csv(r"data/Testdata3.csv", **parse_args)

    df_all = pd.concat([
        # transit_data,
        transit_data2,
        transit_data3,
    ],
        ignore_index=True,
    )
    df_all.dropna(inplace=True)
    # return


    print("Loaded")
    print("Parsing timestamp")
    df_all["Timestamp"] = pd.to_datetime(df_all["Date"] + " " + df_all["Time"], format="%m/%d/%Y %H:%M:%S")


    # remove Event stop
    df_all = df_all[df_all["Stop"] != "Event"]
    print(len(df_all))

    print(df_all["Timestamp"].min())
    # df_all = df_all[df_all["Timestamp"] < "2018-08-01 00:00:00"]



    stops = df_all[["Stop", "Route", "Latitude" , "Longitude"]]
    grouped_stops = stops.groupby(["Stop"])
    # print(grouped_stops["Route"].unique())
    # print(grouped_stops.mean())


    # ensure stops
    # ============

    current_stops = get_stops(db)
    current_stops_keyed = {x.name: x.id for x in current_stops}

    objs = []
    for row in grouped_stops.mean().itertuples():
        name = row.Index
        lat = row.Latitude
        lng = row.Longitude
        if name not in current_stops_keyed:
            objs.append(Stop(name=name, latitude=lat, longitude=lng))
            print(name, lat, lng)
        
    db.bulk_save_objects(objs)
    db.commit()

    current_stops = get_stops(db)
    current_stops_keyed = {x.name: x.id for x in current_stops}


    # ensure buses
    # ============

    current_buses = get_buses(db)
    current_buses_keyed = {x.code: x.id for x in current_buses}

    objs = []
    for code in df_all["Bus"].unique().tolist():
        if code not in current_buses_keyed:
            objs.append(Bus(code=code))
            print(code)
        
    db.bulk_save_objects(objs)
    db.commit()

    current_buses = get_buses(db)
    current_buses_keyed = {x.code: x.id for x in current_buses}


    # ensure routes
    # =============

    current_routes = get_routes(db)
    current_routes_keyed = {x.name: x.id for x in current_routes}

    objs = []
    for route in df_all["Route"].unique().tolist():
        if route not in current_routes_keyed:
            objs.append(Route(name=route))
            print(route)
        
    db.bulk_save_objects(objs)
    db.commit()

    current_routes = get_routes(db)
    current_routes_keyed = {x.name: x.id for x in current_routes}






    print(current_buses_keyed)


    class StopDataChunk(BaseModel):
        stop: str
        route: str
        timestamp: datetime.datetime
        num_on: int = 0
        num_off: int = 0
        pos: tuple


    travels = defaultdict(int)


    print("Grouping for stopdata")
    grouped = df_all.sort_values(by="Timestamp", ascending=True).groupby(["Bus"], as_index=False, sort=False)
    for name, group in grouped:
        # if name != "2401":
        #     continue
        print(name, group.Timestamp.min(), group.Timestamp.max())
        # print(group)

        chunks = []
        current_chunk = None

        for i, row in enumerate(group.values.tolist()):
            _, _, _, num, action, lat, lng, route, stop, timestamp = row

            # start first chunk
            if i == 0:
                current_chunk = StopDataChunk(
                    stop=stop,
                    route=route,
                    timestamp=timestamp,
                    pos=(lat, lng),
                )

            # different stop name
            is_new = stop != current_chunk.stop

            # maximum time to consider new stop
            # is_new |= pd.Timedelta(timestamp - stop_time).total_seconds() > 30*60

            # maximum distance between stop locations (even of same name)
            dist = haversine(current_chunk.pos, (lat, lng))
            if dist > 0.015:
                is_new = True

            # met criteria for a new stopdata entry
            if is_new:
                # record current chunk
                chunks.append(current_chunk)
                # start fresh chunk
                current_chunk = StopDataChunk(
                    stop=stop,
                    route=route,
                    timestamp=timestamp,
                    pos=(lat, lng),
                )

            # apply this row to the current chunk
            if action == "on":
                current_chunk.num_on += num
            else:
                current_chunk.num_off += num



        chunks.append(current_chunk)

        # check travels
        for i in range(len(chunks) - 1):
            c0 = chunks[i]
            c1 = chunks[i+1]
            dt = (c1.timestamp - c0.timestamp).total_seconds()
            if dt < 3*60*60:
                travels[tuple(sorted([c0.stop, c1.stop]))] += 1
                # print(c0)
                # print(dt / 60)
                # print()

    # for k, v in travels.items():
    #     print(k, v)

    print(len(travels))

    for k in sorted(travels.keys(), key=lambda x: travels[x], reverse=True)[:100]:
        print(k, travels[k])

    # break

        # bus_id = current_buses_keyed[name]
        # objs = [
        #     StopData(
        #         bus=bus_id,
        #         route=current_routes_keyed[x.route],
        #         stop=current_stops_keyed[x.stop],
        #         timestamp=x.timestamp,
        #         num_people_on=x.num_on,
        #         num_people_off=x.num_off,
        #     )
        #     for x in chunks
        # ]
        # print(f"Inserting {len(objs)} stopdata rows...")
        # db.bulk_save_objects(objs)
        # db.commit()



    db.close()
    return

    grouped_stops.mean().plot(kind="scatter", y="Latitude", x="Longitude")
    plt.show()

    buses = df_all[["Bus", "Route", "Timestamp"]].groupby("Bus")
    print(buses["Route"].unique())
    
    # bus = buses.get_group(2405)
    # bus["Y"] = 0
    # bus.Y[bus.Route == "Silver"] = 1
    # bus.Y[bus.Route == "Gold"] = 2
    # bus.Y[bus.Route == "Green"] = 3
    # bus.plot(x="Timestamp", y="Y")
    # plt.show()
    # print(bus)


    # print(stops.mean())




    return


    # stops = df_all.groupby(["Stop"], as_index=False).size()
    # print(stops)

    # stops = pd.DataFrame(transit_data[["Stop", "Latitude" , "Longitude"]])
    # buses = pd.DataFrame(transit_data[["Bus", "Route"]])


    # print("//////////////////////////////////////////////////////////////////////////////////////////////////////////////")
    # #Show stop of Silver
    # print("-------------------- Most Stopped Silver routes ------------------------")
    # silver = df_all.loc[df_all['Route'] == 'Silver']
    # print(silver['Stop'].value_counts())
    # print(silver.head(50))

    # print("-------------------- Most Stopped Green routes ------------------------")
    # #Show stops of Green
    # green = df_all.loc[df_all['Route'] == 'Green'] 
    # print(green['Stop'].value_counts())
    # #print(green.head(30))

    # print("-------------------- Most Stopped Gold routes ------------------------")
    # #Show stops of Gold
    # gold = df_all.loc[df_all['Route'] == 'Gold']
    # print(gold['Stop'].value_counts())
    # #print(gold.head(30))


    # print("---------------------- Most Used Stop -------------------------")
    # print(df_all['Stop'].value_counts())

    # print("------------------- Most popular use of bus ----------------------")
    # print(df_all['Route'].value_counts())

    # print("------------------------------- Bus Id ----------------------------------")
    # print(df_all['Bus'].value_counts())

    # print("--------------------------------------")
    # print()
    
        # break
        # group_data = df_all.iloc[grouped[key]].sort_values(by="Timestamp")
        # for row in group_data.values.tolist():
        #     print(row)

    # print(len(grouped))


if __name__ == "__main__":
    main()