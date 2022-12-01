import './App.scss'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Nav from 'react-bootstrap/Nav'
import Dropdown from 'react-bootstrap/Dropdown'
import Stack from 'react-bootstrap/Stack'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'

import LOGO from './resources/logo.png'
import UNCC_LOGO from './resources/UNC_Charlotte_Primary_Horiz_Logo.png'

import {BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate, useLocation} from 'react-router-dom'
import { createContext, useContext, useReducer, useState , useEffect} from 'react'

import StopsPage from './app/stopsPage'
import BusesPage from './app/busesPage'
import { dateToISO, timeToHHMMSS } from './utility'


export const AppContext = createContext()




// component to handle filtering buses and routes
const BusRouteSelector = () => {
    // extract necessary data
    const {filter, modifyFilter, buses, routes} = useContext(AppContext)

    // higher order actions to simplify later code
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

// component to handle time of day filtering for data
const TimeSelector = () => {
    // extract necessary data
    const {filter, modifyFilter} = useContext(AppContext)
    const {minTime, maxTime} = filter

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

    // get text of values
    const fromText = xToTimeText(minTime)
    const toText = xToTimeText(maxTime)

    // events when sliders are changing
    // reduce number of state updates by comparing to current values
    const onMinTimeChange = e => {
        const value = parseInt(e.target.value)
        if(value == minTime)
            return
        modifyFilter({type: 'TIME.MIN', value})
    }
    const onMaxTimeChange = e => {
        const value = parseInt(e.target.value)
        if(value == maxTime)
            return
        modifyFilter({type: 'TIME.MAX', value})
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
                    <Form.Range min={0} max={24*2} step={1} value={minTime} onChange={onMinTimeChange}/>
                    <Stack direction="horizontal">
                        <label className="flex-grow-1 fw-bold">To</label>
                        <label className="">{toText}</label>
                    </Stack>
                    <Form.Range min={0} max={24*2} step={1} value={maxTime} onChange={onMaxTimeChange}/>
                </Form>
            </Dropdown.Menu>
       </Dropdown>
    );
}


// component to handle date range selection for filtering
const DateSelector = () => {
    // extract necessary data
    const {filter, modifyFilter} = useContext(AppContext)
    const {minDate, maxDate} = filter

    // internal component to handle a single date (day, month, year) dropdowns
    const DateDropdowns = (props) => {
        const {date, setDate} = props

        // possible values
        const years = [2018, 2019, 2020]
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
        
        // split to parts
        const day = date.getDate()
        const month = date.getMonth()
        const year = date.getFullYear()
        
        // check month information
        const lastOfMonth = new Date(year, month + 1, 0)
        const daysInMonth = lastOfMonth.getDate()
        
        // need a function for updating the day to stay as close as possible when switching to different months (Dec 31 -> Feb 28, not Feb 31)
        const setDateCorrectedDay = (year, month) => {
            const minDay = new Date(year, month).getDate()
            const maxDay = new Date(year, month + 1, 0).getDate()
            const newDay = Math.min(Math.max(day, minDay), maxDay)
            setDate(new Date(year, month, newDay))
        }
        
        // event when day dropdown changed
        const onSelectDay = day => {
            // set day exactly
            date.setDate(day)
            setDate(date)
        }
        // event when drop down changed... keep new year and month, but fix day to be nearest valid day
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

    // functions to update App state with correct dates for each group of dropdowns
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


// Component to send requests to server when user clicks instead of auto sending a ton while user changes values
const FetchDataButton = () => {
    // get required data
    const {fetchData} = useContext(AppContext)
    // represent if a request is currently being fetched
    const [loading, setLoading] = useState(false)

    // handle button click
    const onClick = async e => {
        // send request and update loading before/after
        setLoading(true)
        const res = await fetchData()
        setLoading(false)
    }

    if(loading) {
        // show animated loading button that user can't press
        return (
            <Button variant="primary" disabled>
                <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-1"
                />
                Loading...
            </Button>
        )
    } else {
        // show normal button that user can press
        return (
            <Button variant="primary" onClick={onClick}>Fetch Data</Button>
        )
    }

    
}

// Component to represent top navigation bar with logos, navigation, and filters
const NavigationBar = () => {
    // get function to navigate the app
    const navigate = useNavigate()
    // get current location of the app
    const location = useLocation()

    // corrected component that works better...
    // - built in had visual glitches if pressing back button
    // - always would update page even if navigating to the same current page
    const NavLink = ({to, children}) => {
        // check if currently on this page
        const active = location.pathname == to
        // handle link click
        const onClick = e => {
            // only navigate when not same path
            if(!active)
                navigate(to)
        }
        return (
            <Nav.Link onClick={onClick} active={active}>{children}</Nav.Link>
        )
    }

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
                <Nav variant="pills">
                    <NavLink to="/stops">Stops</NavLink>
                    <NavLink to="/buses">Buses</NavLink>
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


// parameters for different types of notifications
const NOTIFICATION_PARAMS = {
    error: {
        bg: 'danger',
        bodyClasses: 'text-white',
    },
    success: {
        bg: 'success',
        bodyClasses: 'text-white',
    }
}

// Component to hold and show notifications on an overlay
const NotificationsContainer = () => {
    const {notifications, removeNotification} = useContext(AppContext)
    return (
        <ToastContainer position="bottom-center" className="p-3">
            {notifications.map((x, i) => {
                const {bg, bodyClasses} = NOTIFICATION_PARAMS[x.type]
                return (
                    <Toast
                        key={i}
                        bg={bg}
                        onClose={() => {
                            removeNotification(x.id)
                        }}
                        show={true}
                    >
                        {/* <Toast.Header>{x.title}</Toast.Header> */}
                        <Toast.Body className={bodyClasses}>{x.message}</Toast.Body>
                    </Toast>
                )
            })}
        </ToastContainer>
    )
}

// Component that defines main layout of App
const Layout = () => {
    // holds navigation bar, main content area for pages, and notification overlay
    return (
        <Container fluid className="h-100 d-flex flex-column">
            <NavigationBar/>
            <Row className="flex-grow-1 overflow-hidden">
                <Outlet/>
            </Row>
            <NotificationsContainer/>
        </Container>
    )
}


// value that increments to keep notifications with unique ids
let _notification_id_sequence = 0


// Main App Component that holds all base state information and functions to update them
const App = () => {    
    // store current bus, route, and stop information
    const[_buses, setBuses] = useState(null)
    const[_routes, setRoutes] = useState(null)
    const[_stops, setStops] = useState(null)
    // cleaner output variables that aren empty arrays instead of null
    const buses = _buses || []
    const routes = _routes || []
    const stops = _stops || []

    // store current filter state and define function to update it in different ways
    const [filter, modifyFilter] = useReducer((state, action) => {
        switch(action.type) {
            // full scale replace with new values
            case 'REPLACE': {
                return action.values
            }
            // edit specific values
            case 'EDIT': {
                return {
                    ...state,
                    ...action.values,
                }
            }
            // toggle a specific route
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
            // toggle a specific bus
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
            // set routes to include all or none
            case 'ROUTE.ALL': {
                return {
                    ...state,
                    routes: (action.value && routes) ? routes.map(x => x.id) : [],
                }
            }
            // set buses to include all or none
            case 'BUS.ALL': {
                return {
                    ...state,
                    buses: (action.value && buses) ? buses.map(x => x.id) : [],
                }
            }
            // update min time and ensure not after max time
            case 'TIME.MIN': {
                const {value} = action
                return {
                    ...state,
                    minTime: value,
                    maxTime: Math.max(value, state.maxTime),
                }
            }
            // update max time and ensure not before min time
            case 'TIME.MAX': {
                const {value} = action
                return {
                    ...state,
                    minTime: Math.min(value, state.minTime),
                    maxTime: value,
                }
            }
            default: return state
        }
    }, {
        // default filter parameters
        minDate: new Date(2019, 0, 1),
        maxDate: new Date(2019, 2, 0),
        minTime: 0,
        maxTime: 24*2,
        routes: [],
        buses: [],
    })

    // store actual stop data and bus data from the server and what filter was used for them
    const [dataFilter, setDataFilter] = useState(null)
    const [stopData, setStopData] = useState(null)
    const [busData, setBusData] = useState(null)

    // store current notifications and define functions for updating them
    const [notifications, updateNotifications] = useReducer((state, action) => {
        switch(action.type) {
            // make a new notification
            case 'send': {
                return [
                    ...state,
                    action.notification,
                ]
            }
            // remove a specific notification
            case 'remove': {
                return state.filter(x => x.id != action.id)
            }
        }
    }, [])

    // high level function for sending a notification
    const sendNotification = (type, title, message) => {
        // make new notification with a unique id
        const id = _notification_id_sequence
        _notification_id_sequence += 1
        updateNotifications({type: 'send', notification: {id, type, title, message}})
        // auto remove after delay
        setTimeout(() => {
            removeNotification(id)
        }, 3000);
    }
    // high level function to remove a notification
    const removeNotification = id => updateNotifications({type: 'remove', id})

    // wrap function for sending requests to server, read json response, and display error notifications in app
    const apiFetch = async (url, options) => {
        // send request
        const response = await fetch(url, options)
        // show notification if not successful
        if(response.status !== 200) {
            sendNotification('error', 'Error', `Error ${response.status} while fetching data from server!`)
            return null
        }
        // return json response
        const data = await response.json()
        return data
    }

    // function to fetch buses from server
    const fetchBuses = async () => {
        // no need to get data if already has it
        if(_buses != null)
            return
        // send request and store results
        const data = await apiFetch("/api/buses")
        if(data != null) {
            setBuses(data)
            // auto-update filter to include all buses
            modifyFilter({type: 'BUS.ALL', value: true})
        }
    }

    // function to fetch routes from server
    const fetchRoutes = async () => {
        // no need to get data if already has it
        if(_routes != null)
            return
        // send request and store results
        const data = await apiFetch("/api/routes")
        if(data != null) {
            setRoutes(data)
            // auto-update filter to include all routes
            modifyFilter({type: 'ROUTE.ALL', value: true})
        }
    }

    // function to fetch stops from server
    const fetchStops = async () => {
        // no need to get data if already has it
        if(_stops != null)
            return
        // send request and store results
        const data = await apiFetch("/api/stops")
        if(data != null) {
            setStops(data)
        }
    }


    // function to make filter data for data requests
    const dataRequestBody = () => {
        const {minDate, maxDate, minTime, maxTime, buses, routes} = filter 
        const body = { 
            min_date: dateToISO(minDate),
            max_date: dateToISO(maxDate),
            min_time: timeToHHMMSS(minTime),
            max_time: timeToHHMMSS(maxTime),
            bus_ids: buses,
            route_ids: routes,
        }
        return body
    }

    // function to get stop data based on filters
    const fetchStopData = async () => {  
        // fetch and store data from server 
        const data = await apiFetch("/api/data/stopinfo", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataRequestBody()),
        })
        if(data != null) {
            setStopData(data)
        }
        return data != null
    }

    // function to get bus data based on filters
    const fetchBusData = async () => {   
        // fetch and store data from server  
        const data = await apiFetch("/api/data/businfo", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataRequestBody()),
        })
        if(data != null) {
            setBusData(data)
        }
        return data != null
    }

    // on app first load, get base information
    useEffect(() => {
        fetchBuses()
        fetchRoutes()
        fetchStops()
    }, []);

    // function to get bus and stop data together and show result
    const fetchData = async () => {
        const t0 = Date.now()
        // fetch stop data and bus data
        const res = await Promise.all([
            fetchStopData(),
            fetchBusData(),
        ])
        const t1 = Date.now()
        const elapsed = t1 - t0
        // show notification
        if(!res.every(x => x)) {
            // an error occurred
            sendNotification('error', 'Error', 'Could not fetch data!')
        } else {
            // show how long it took to get the data
            const timeStr = (elapsed / 1000).toFixed(1)
            sendNotification('success', 'Yay', `Data loaded successfully in ${timeStr}s!`)
        }
        // store filter used for this fetch
        setDataFilter(filter)
        return res
    }

    // data/functions that will be accessible to any components inside the app
    const contextValue = {
        filter,
        modifyFilter,
        buses,
        stops,
        routes,
        stopData,
        busData,
        dataFilter,
        fetchData,
        notifications,
        sendNotification,
        removeNotification,
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
