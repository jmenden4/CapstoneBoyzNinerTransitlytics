import { useEffect, useContext, useState} from 'react'
import Table from 'react-bootstrap/Table'
import THSortable from './tables.js'
import {AppContext} from '../App.js'
import Gradient from '../gradient'



const daysBetween = (aDate, bDate) => {
    // do date difference in UTC to avoid Daylight Savings Time
    const aUTC = Date.UTC(aDate.getFullYear(), aDate.getMonth(), aDate.getDate())
    const bUTC = Date.UTC(bDate.getFullYear(), bDate.getMonth(), bDate.getDate())
    const MS_PER_DAY = 1000 * 60 * 60 * 24
    return Math.floor((bUTC - aUTC) / MS_PER_DAY)
}



// const intensityGradient = new Gradient(['003f5c', '7a5195', 'ef5675', 'ffa600'])
const intensityGradient = new Gradient(['ffffff', 'ffa600'])


const BusesPage = () => {
    const {filter, buses, busData} = useContext(AppContext)
    const {minDate, maxDate} = filter
    const [sortState, setSortState] = useState({
        key: 'name',
        ascending: true,
    })

    // calculate number of days currently considered in the data
    const numDays = daysBetween(minDate, maxDate) + 1

    // organize data by bus id
    const dataByBus = {}
    if(busData != null) {
        busData.forEach(x => {
            dataByBus[x.id] = x
        })
        // get range of miles
        const eachMiles = busData.map(x => x.distance_from_last)
        const minMiles = Math.min(...eachMiles)
        const maxMiles = Math.max(...eachMiles)
        // assign relative values and colors
        Object.values(dataByBus).forEach(x => {
            x.relativeMiles = (x.distance_from_last - minMiles) / (maxMiles - minMiles)
            x.relativeMilesColor = intensityGradient.colorAt(x.relativeMiles)
        })
    }

    const busesWithData = buses.map(bus => {
        return {
            bus,
            data: dataByBus[bus.id],
        }
    })
    

    const tableOrderRows = [...busesWithData].sort((a, b) => {
        const {key, ascending} = sortState
        let result = 0
        if(key != 'name') {
            if(a.data && b.data) {
                switch(key) {
                    case 'miles':
                    case 'avg_miles': {
                        result = a.data.distance_from_last - b.data.distance_from_last
                        break
                    }
                    case 'refuel':
                    case 'oil_change':
                    case 'inspection': {
                        result = 1 / a.data.distance_from_last - 1 / b.data.distance_from_last
                        break
                    }
                }
            } else if(a.data) {
                // force a to go before b (b doesn't have data)
                return -1
            } else if(b.data) {
                // force a to go after b (a doesn't have data)
                return 1
            }
        }
        // default name sort if tie
        if(result == 0) {
            result = parseInt(a.bus.code) - parseInt(b.bus.code)
        }
        return ascending ? result : -result
    })

    const REFUEL_INTERVAL_MI = 500
    const OIL_CHANGE_INTERVAL_MI = 1000
    const INSPECTION_INTERVAL_MI = 2000


    return (
        <div style={{
            marginRight: 'auto',
            marginLeft: 'auto',
            maxWidth: 1200,
            marginTop: 100,
        }}>

            

            <Table className="table table-bordered table-hover" style={{
                tableLayout: 'fixed',
            }}>
                <thead>
                    <tr>
                        <th className="bus-table-col1"></th>
                        <th></th>
                        <th></th>
                        <th className="text-center" colSpan="3">Maintenance Intervals (Days)</th>
                    </tr>
                    <tr>
                        <THSortable className="bus-table-col1" name="Bus" sortKey="name" defaultAscending sortState={sortState} setSortState={setSortState}/>
                        <THSortable name="Miles Driven" sortKey="miles" sortState={sortState} setSortState={setSortState} alignRight/>
                        <THSortable name="Avg Miles / Day" sortKey="avg_miles" sortState={sortState} setSortState={setSortState} alignRight/>
                        <THSortable name="Refuel" sortKey="refuel" sortState={sortState} setSortState={setSortState} alignRight/>
                        <THSortable name="Oil Change" sortKey="oil_change" sortState={sortState} setSortState={setSortState} alignRight/>
                        <THSortable name="Inspection" sortKey="inspection" sortState={sortState} setSortState={setSortState} alignRight/>
                    </tr>
                </thead>
                <tbody>
                    {tableOrderRows.map((x, i) => {
                        const {bus, data} = x
                        
                        if(data != null) {
                            const MI_PER_KM = 0.621371
                            const milesDriven = data.distance_from_last * MI_PER_KM
                            const avgMilesPerDay = milesDriven / numDays
                            return (
                                <tr key={i}>
                                    <td className="bus-table-col1">{bus.code}</td>
                                    <td className="text-end" style={{backgroundColor: data.relativeMilesColor}}>{(milesDriven).toFixed(1)}</td>
                                    <td className="text-end">{(avgMilesPerDay).toFixed(1)}</td>    
                                    <td className="text-end">{(REFUEL_INTERVAL_MI / avgMilesPerDay).toFixed(1)}</td>    
                                    <td className="text-end">{(OIL_CHANGE_INTERVAL_MI / avgMilesPerDay).toFixed(1)}</td>    
                                    <td className="text-end">{(INSPECTION_INTERVAL_MI / avgMilesPerDay).toFixed(1)}</td>    
                                </tr>
                            )
                        } else {
                            return (
                                <tr key={i}>
                                    <td className="bus-table-col1">{bus.code}</td>
                                    <td className="text-end">-</td>
                                    <td className="text-end">-</td>    
                                    <td className="text-end">-</td>    
                                    <td className="text-end">-</td>    
                                    <td className="text-end">-</td>    
                                </tr>
                            )
                        }
                        
                        
                    })}
                </tbody>
            </Table>
        </div>
    )

}

export default BusesPage