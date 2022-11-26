import './App.scss'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Nav from 'react-bootstrap/Nav'
import Dropdown from 'react-bootstrap/Dropdown'
import Stack from 'react-bootstrap/Stack'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import LOGO from './resources/logo.png'
import UNCC_LOGO from './resources/UNC_Charlotte_Primary_Horiz_Logo.png'


import {BrowserRouter, Routes, Route, Navigate, Outlet} from 'react-router-dom'
import {LinkContainer} from 'react-router-bootstrap'

import { createContext, useContext, useReducer, useState , useEffect} from 'react'

import StopsPage from './app/stopsPage'
import BusesPage from './app/busesPage'



export const AppContext = createContext()




const BusRouteSelector = () => {
    const {filter, modifyFilter, buses, routes} = useContext(AppContext)

    const toggleRoute = key => modifyFilter({type: 'ROUTE.TOGGLE', key})
    const toggleBus = key => modifyFilter({type: 'BUS.TOGGLE', key})
    const setAllRoutes = value => modifyFilter({type: 'ROUTE.ALL', value})
    const setAllBuses = value => modifyFilter({type: 'BUS.ALL', value})

    return (
        <Dropdown>
            <Dropdown.Toggle>
                Buses
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Form className="px-2">
                    <Stack direction="horizontal" className="mb-2">
                        <label className="flex-grow-1">Routes</label>
                        <Button variant="link" size="sm" onClick={e => setAllRoutes(true)}>All</Button>
                        <Button variant="link" size="sm" onClick={e => setAllRoutes(false)}>None</Button>
                    </Stack>
                    {routes.map(x => (
                        <Form.Check key={x.id} label={x.name} checked={filter.routes.includes(x.id)} onChange={e => toggleRoute(x.id)}/>
                    ))}
                    <Stack direction="horizontal" className="my-2">
                        <label className="flex-grow-1">Buses</label>
                        <Button variant="link" size="sm" onClick={e => setAllBuses(true)}>All</Button>
                        <Button variant="link" size="sm" onClick={e => setAllBuses(false)}>None</Button>
                    </Stack>
                    {buses.map(x => (
                        <Form.Check key={x.id} label={x.code} checked={filter.buses.includes(x.id)} onChange={e => toggleBus(x.id)}/>
                    ))}
                </Form>
            </Dropdown.Menu>
        </Dropdown>
    );
}

const TimeSelector = () => {
    const {valueStartTime, setValueStartTime, valueEndTime, setValueEndTime} = useContext(AppContext)
    const [range, adjustRange] = useReducer((currentRange, action) => {
        const [fromValue, toValue] = currentRange
        const {type, x} = action
        switch(type) {
            case 'from': {
                return [
                    x,
                    Math.max(x, toValue),
                ]
            }
            case 'to': {
                return [
                    Math.min(x, fromValue),
                    x,
                ]
            }
        }
    }, [0, 24])

    // extract ends from range
    const [fromValue, toValue] = range

    // function to make 12hour AM/PM text from slider value
    const xToTimeText = x => {
        const hour24 = Math.floor(x / 2)
        const part = x % 2

        let hour12 = hour24 % 12
        if(hour12 == 0) {
            hour12 = 12
        }

        const isAM = x < 24 || x == 48

        return `${hour12}:${String(part * 30).padStart(2, "0")}${isAM ? "am" : "pm"}`
    }

    const fromText = xToTimeText(fromValue)
    const toText = xToTimeText(toValue)

    const handleTimeStartChange=(e)=>{
        setValueStartTime(e)
    }

    const handleTimeEndChange=(e)=>{
        setValueEndTime(e)
    }

    const twoCalls = e => {
        adjustRange({type: 'from', x: e.target.value});
        handleTimeStartChange();
      }

    return (
        <Dropdown>
            <Dropdown.Toggle>
                Time
            </Dropdown.Toggle>
            <Dropdown.Menu style={{
                width: "200px",
            }}>
                <Form className="px-2">
                    <Stack direction="horizontal">
                        <label className="flex-grow-1 fw-bold">From</label>
                        <label className="">{fromText}</label>
                    </Stack>
                    <Form.Range min={0} max={24*2} step={1} value={fromValue} /*onInput={handleTimeEndChange()}*/ onChange={e => adjustRange({type: 'from', x: e.target.value})}/>
                    {/* <Dropdown.Divider/> */}
                    <Stack direction="horizontal">
                        <label className="flex-grow-1 fw-bold">To</label>
                        <label className="">{toText}</label>
                    </Stack>
                    <Form.Range min={0} max={24*2} step={1} value={toValue} /*onInput={handleTimeStartChange()}*/ onChange={e => adjustRange({type: 'to', x: e.target.value})}/>
                </Form>
            </Dropdown.Menu>
       </Dropdown>
    );
}



const DateSelector = () => {
    const {filter, modifyFilter} = useContext(AppContext)
    const {minDate, maxDate} = filter


    const DateDropdowns = (props) => {
        const {date, setDate} = props

        const years = [2018, 2019, 2020]
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
        
        const day = date.getDate()
        const month = date.getMonth()
        const year = date.getFullYear()
        
        const lastOfMonth = new Date(year, month + 1, 0)
        const daysInMonth = lastOfMonth.getDate()
        
        const setDateCorrectedDay = (year, month) => {
            const minDay = new Date(year, month).getDate()
            const maxDay = new Date(year, month + 1, 0).getDate()
            const newDay = Math.min(Math.max(day, minDay), maxDay)
            setDate(new Date(year, month, newDay))
        }
        
        const onSelectDay = day => {
            date.setDate(day)
            setDate(date)
        }

        const onSelectMonth = i => setDateCorrectedDay(year, parseInt(i))
        const onSelectYear = i => setDateCorrectedDay(parseInt(i), month)

        return (
            <>
                <Dropdown onSelect={onSelectDay}>        
                    <Dropdown.Toggle variant="outline-secondary" size="sm">
                        {day}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="limit-height-dropdown">
                        {Array(daysInMonth).fill().map((_, i) => (
                            <Dropdown.Item eventKey={i+1} key={i}>{i + 1}</Dropdown.Item>)
                        )}
                    </Dropdown.Menu>
                </Dropdown>
                <Dropdown onSelect={onSelectMonth}>        
                    <Dropdown.Toggle variant="outline-secondary" size="sm">
                        {monthNames[month]}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="limit-height-dropdown">
                        {monthNames.map((name, i) => (
                            <Dropdown.Item eventKey={i} key={i}>{name}</Dropdown.Item>)
                        )}
                    </Dropdown.Menu>
                </Dropdown>
                <Dropdown onSelect={onSelectYear}>
                    <Dropdown.Toggle variant="outline-secondary" size="sm">
                        {year}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="limit-height-dropdown">
                        {years.map(year => (
                            <Dropdown.Item eventKey={year} key={year}>{year}</Dropdown.Item>)
                        )}
                    </Dropdown.Menu>
                </Dropdown>    
            </>
        )
    }

    const setMinDate = date => modifyFilter({type: 'EDIT', values: {minDate: date}})
    const setMaxDate = date => modifyFilter({type: 'EDIT', values: {maxDate: date}})

    return (
        <Dropdown autoClose = "outside">
            <Dropdown.Toggle>
                Date
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Form className="px-2 py-2">
                    <Stack direction="horizontal" className="mb-3" gap={2}>
                        <div className="flex-grow-1 fw-bold">From</div> 
                        <DateDropdowns date={minDate} setDate={setMinDate}/>
                    </Stack>
                    <Stack direction="horizontal" gap={2}>
                        <div className="flex-grow-1 fw-bold">To</div>
                        <DateDropdowns date={maxDate} setDate={setMaxDate}/>
                    </Stack>
                </Form>
            </Dropdown.Menu>
        </Dropdown>
    )
}


const FetchDataButton = () => {
    return (
        <Button variant="primary">Fetch Data</Button>
    )
}


const NavigationBar = () => {
    return (
        <Row className="border-bottom py-2 align-items-end">
            <Col>
                <div className="d-flex align-items-center pb-2">
                    <img src={LOGO} style={{
                        width: "48px",  
                    }}/>
                    <div className="h4 mx-2 m-0">
                        TRANSIT NINERLYTICS&#8482;
                    </div>
                </div>
                <Nav variant="pills" className="">
                    <Nav.Item>
                        <LinkContainer to="/stops">
                            <Nav.Link>Stops</Nav.Link>
                        </LinkContainer>
                    </Nav.Item>
                    <Nav.Item>
                        <LinkContainer to="/buses">
                            <Nav.Link>Buses</Nav.Link>
                        </LinkContainer>
                    </Nav.Item>
                </Nav>
            </Col>
            <Col>
                <Stack direction="horizontal" gap={2} className="justify-content-center">
                    <BusRouteSelector/>
                    <TimeSelector/>
                    <DateSelector/>
                    <FetchDataButton/>
                </Stack>
            </Col>
            <Col className="align-self-center d-flex justify-content-end">
                <img src={UNCC_LOGO} style={{
                    width: "200px",  
                }}/>
            </Col>       
        </Row>
    )
}


const Layout = () => {
    return (
        <Container fluid className="h-100 d-flex flex-column">
            <NavigationBar/>
            <Row className="flex-grow-1 overflow-hidden">
                <Outlet/>
            </Row>
        </Container>
    )
}


const App = () => {

    const[_buses, setBus] = useState(null);
    const[_routes, setRoutes] = useState(null);
    const[_stops, setStops] = useState(null);

    const buses = _buses || []
    const routes = _routes || []
    const stops = _stops || []


    const [filter, modifyFilter] = useReducer((state, action) => {
        console.info(action)
        switch(action.type) {
            case 'REPLACE': {
                return action.values
            }
            case 'EDIT': {
                return {
                    ...state,
                    ...action.values,
                }
            }
            case 'ROUTE.TOGGLE': {
                const {key} = action
                const newRoutes = state.routes
                const i = newRoutes.indexOf(key)
                if(i === -1) {
                    newRoutes.push(key)
                } else {
                    newRoutes.splice(i, 1)
                }
                return {
                    ...state,
                    routes: newRoutes,
                }
            }
            case 'BUS.TOGGLE': {
                const {key} = action
                const newBuses = state.buses
                const i = newBuses.indexOf(key)
                if(i === -1) {
                    newBuses.push(key)
                } else {
                    newBuses.splice(i, 1)
                }
                return {
                    ...state,
                    buses: newBuses,
                }
            }
            case 'ROUTE.ALL': {
                return {
                    ...state,
                    routes: (action.value && routes) ? routes.map(x => x.id) : [],
                }
            }
            case 'BUS.ALL': {
                return {
                    ...state,
                    buses: (action.value && buses) ? buses.map(x => x.id) : [],
                }
            }
            default: return state
        }
    }, {
        minDate: new Date(2018, 0, 1),
        maxDate: new Date(2018, 11, 31),
        minTime: 0,
        maxTime: 24*2,
        routes: [],
        buses: [],
    })


    const [stopData, setStopData] = useState(null)


    const fetchBuses = async () => {
        if(_buses != null)
            return
        fetch("/api/buses")
        .then(response => response.json())
        .then(data => setBus(data));
    }

    const fetchRoutes = async () => {
        if(_routes != null)
            return
        fetch("/api/routes")
        .then(response => response.json())
        .then(data => setRoutes(data));
    }

    const fetchStops = async () => {
        if(_stops != null)
            return
        fetch("/api/stops")
        .then(response => response.json())
        .then(data => setStops(data));
    }

    const fetchStopData = async () => {   
        const {minDate, maxDate, minTime, maxTime, buses, routes} = filter 

        const dateToISO = date => date.toLocaleDateString('en-CA')

        const timeToHHMMSS = time => {
            let hours = Math.floor(time / 2)
            let minutes = (time % 2) * 30
            let seconds = 0
            if(time == 48) {
                hours = 23
                minutes = 59
                seconds = 59
            }
            hours = hours.toString().padStart(2, '0')
            minutes = minutes.toString().padStart(2, '0')
            seconds = seconds.toString().padStart(2, '0')
            return `${hours}:${minutes}:${seconds}`
        }

        const body = { 
            min_date: dateToISO(minDate),
            max_date: dateToISO(maxDate),
            min_time: timeToHHMMSS(minTime),
            max_time: timeToHHMMSS(maxTime),
            bus_ids: buses,
            route_ids: routes,
        }
        // console.info(body)
        try {
            const response = await fetch("/api/data/stopinfo", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })
            const data = await response.json()
            // console.info(data)
            setStopData(data)
        } catch(err) {
            console.info(err)
        }

    }


    useEffect(() => {
        fetchBuses()
        fetchRoutes()
        fetchStops()
    }, []);

    useEffect(() => {
        fetchStopData()
    }, [filter])

    const contextValue = {
        filter,
        modifyFilter,
        buses,
        stops,
        routes,
        stopData,
    }

    return (
        <BrowserRouter>
            <AppContext.Provider value={contextValue}>
                <Routes>
                    <Route path="/" element={<Layout/>}>
                        <Route index element={<Navigate to="stops" replace />} />
                        <Route path="stops" element={<StopsPage/>}/>
                        <Route path="buses" element={<BusesPage/>}/>
                    </Route>
                </Routes>
            </AppContext.Provider>
        </BrowserRouter>
    )
}


export default App
