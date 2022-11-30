import { useEffect, useContext, useState, useReducer} from 'react'
import Table from 'react-bootstrap/Table'
import THSortable from './tables.js'
import {AppContext} from '../App.js'
import Gradient from '../gradient'
import Button from 'react-bootstrap/Button'
import Popover from 'react-bootstrap/Popover'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'


const daysBetween = (aDate, bDate) => {
    // do date difference in UTC to avoid Daylight Savings Time
    const aUTC = Date.UTC(aDate.getFullYear(), aDate.getMonth(), aDate.getDate())
    const bUTC = Date.UTC(bDate.getFullYear(), bDate.getMonth(), bDate.getDate())
    const MS_PER_DAY = 1000 * 60 * 60 * 24
    return Math.floor((bUTC - aUTC) / MS_PER_DAY)
}



const intensityGradient = new Gradient(['ffffff', 'ffa600'])


const fromLocalStorage = (key, defaultValue) => {
    try {
        const value = localStorage.getItem(key)
        if(value != null)
            return value
    } catch(e) {
        console.error(e)
    }
    return defaultValue
}


const BusesPage = () => {
    const {dataFilter, buses, busData} = useContext(AppContext)
    const [sortState, setSortState] = useState({
        key: 'name',
        ascending: true,
    })


    let numDays = null

    // organize data by bus id
    const dataByBus = {}
    if(busData != null && dataFilter != null) {
        // calculate number of days currently considered in the data
        const {minDate, maxDate} = dataFilter
        numDays = daysBetween(minDate, maxDate) + 1

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

    
    const [intervalModalShown, setIntervalModalShown] = useState(false)
    const [modalValidated, setModalValidated] = useState(false)
    const [modalState, setModalState] = useState({})
    
    const [intervals, updateIntervals] = useReducer((state, action) => {
        const {key, miles} = action
        state[key].miles = miles
        try {
            localStorage.setItem(state[key].storage_key, miles)
        } catch(e) {
            console.error(e)
        }
        return state
    }, [
        {
            key: 0,
            name: 'Refuel',
            message: 'Enter how far a bus can travel before refueling.',
            miles: fromLocalStorage('refuel_interval', 500),
            storage_key: 'refuel_interval',
        },
        {
            key: 1,
            name: 'Oil Change',
            message: 'Enter how far a bus can travel before needing an oil change.',
            miles: fromLocalStorage('oil_change_interval', 1000),
            storage_key: 'oil_change_interval',
        },
        {
            key: 2,
            name: 'Inspection',
            message: 'Enter how far a bus can travel before needing an inspection.',
            miles: fromLocalStorage('inspection_interval', 2000),
            storage_key: 'inspection_interval',
        },
    ])
    
    const showIntervalModal = (interval) => {
        setModalState(interval)
        setIntervalModalShown(true)
        setModalValidated(false)
    }
  
    const onSubmit = e => {
        e.preventDefault()
        console.info('submit')
        const {key, miles} = modalState
        const valid = e.target.checkValidity()
        if(valid) {
            updateIntervals({key, miles})
            setIntervalModalShown(false)
        }
        setModalValidated(true)
    }
    
    return (
        <div style={{
            marginRight: 'auto',
            marginLeft: 'auto',
            maxWidth: 1000,
        }}>
            <Modal
                show={intervalModalShown}
                onHide={() => setIntervalModalShown(false)}
                centered
            >
                <Modal.Header>
                    <Modal.Title>{modalState.name} Interval</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate validated={modalValidated} onSubmit={onSubmit}>
                        <div className="mb-2">
                            {modalState.message}
                        </div>
                        <Form.Text>
                            Distance (miles)
                        </Form.Text>
                        <Form.Group className="mb-3">
                            <Form.Control type="number" placeholder="Miles" min={1} required value={modalState.miles} onChange={e => {
                                setModalState({
                                    ...modalState,
                                    miles: e.target.value,
                                })
                            }} autoFocus/>
                            <Form.Control.Feedback type="invalid">
                                Must be more than 0 miles.
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="d-flex justify-content-end">
                            <Button type="submit">Done</Button>
                        </Form.Group>
                    </Form>  
                </Modal.Body>
            </Modal>

            <div className="d-flex flex-row mt-5 mb-4">
                <div className="d-flex align-items-center" style={{
                    width: '46%',
                }}>
                    <span className="p-2 fw-bold">
                        Days: {numDays == null ? 'N/A' : numDays.toLocaleString()}
                    </span>
                </div>
                {intervals.map((x, i) => {
                    return (
                        <div key={i} className="d-flex" style={{width: '18%'}}>
                            <Button className="flex-grow-1 m-2" onClick={e => showIntervalModal(x)}>{x.miles} mi.</Button>
                        </div>
                    )
                })}
            </div>

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
                        <THSortable name="Refuel" sortKey="refuel" defaultAscending sortState={sortState} setSortState={setSortState} alignRight/>
                        <THSortable name="Oil Change" sortKey="oil_change" defaultAscending sortState={sortState} setSortState={setSortState} alignRight/>
                        <THSortable name="Inspection" sortKey="inspection" defaultAscending sortState={sortState} setSortState={setSortState} alignRight/>
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
                                    {intervals.map((x, i) => 
                                        <td key={i} className="text-end">{(x.miles / avgMilesPerDay).toFixed(1)}</td>
                                    )} 
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