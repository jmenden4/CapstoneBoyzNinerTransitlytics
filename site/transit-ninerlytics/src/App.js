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




const FilterSelector = () => {

    const {filter, setFilter, buses, routes} = useContext(AppContext)
    
    const toggleRouteFilter = (key) => {
        const newRoutes = filter.routes
        const i = newRoutes.indexOf(key)
        if(i === -1) {
            newRoutes.push(key)
        } else {
            newRoutes.splice(i, 1)
        }
        setFilter({
            ...filter,
            routes: newRoutes,
        })
    }

    const toggleBusFilter = (key) => {
        const newBuses = filter.buses
        const i = newBuses.indexOf(key)
        if(i === -1) {
            newBuses.push(key)
        } else {
            newBuses.splice(i, 1)
        }
        setFilter({
            ...filter,
            buses: newBuses,
        })
    }

    const setAllRoutesFilter = value => setFilter({
        ...filter,
        routes: value ? routes : [],
    })

    const setAllBusesFilter = value => setFilter({
        ...filter,
        buses: value ? buses : [],
    })

    return (
        <Dropdown>
            <Dropdown.Toggle>
                Filter
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Form className="px-2">
                    <Stack direction="horizontal" className="mb-2">
                        <label className="flex-grow-1">Routes</label>
                        <Button variant="link" size="sm" onClick={e => setAllRoutesFilter(true)}>All</Button>
                        <Button variant="link" size="sm" onClick={e => setAllRoutesFilter(false)}>None</Button>
                    </Stack>
                    {routes.map(x => (
                        <Form.Check key={x.id} label={x.name} checked={filter.routes.includes(x)} onChange={e => toggleRouteFilter(x)}/>
                    ))}
                    <Stack direction="horizontal" className="my-2">
                        <label className="flex-grow-1">Buses</label>
                        <Button variant="link" size="sm" onClick={e => setAllBusesFilter(true)}>All</Button>
                        <Button variant="link" size="sm" onClick={e => setAllBusesFilter(false)}>None</Button>
                    </Stack>
                    {buses.map(x => (
                        <Form.Check key={x.id} label={x.code} checked={filter.buses.includes(x)} onChange={e => toggleBusFilter(x)}/>
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

    // let dropdownText = null
    // if(fromValue == 0 && toValue == 48) {
    //     dropdownText = 'All Day'
    // } else {
    //     dropdownText = `${fromText} - ${toText}`
    // }

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
    const {valueFM, setValueFM, valueFY, setValueFY, valueTM, setValueTM, valueTY, setValueTY, valueStartDay, setValueStartDay, valueEndDay, setValueEndDay} = useContext(AppContext)
    const years = [2018, 2019, 2020]
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"]

    const handleSelectFM=(e)=>{
        console.log(e)
        setValueFM(e)
    }
    
    const handleSelectFY=(e)=>{
        console.log(e)
        setValueFY(e)
    }

 
    const handleSelectTM=(e)=>{
        setValueTM(e)
    }

    const handleSelectTY=(e)=>{
        setValueTY(e)
    }

    const handleSelectStartDay=(e)=>{
        setValueStartDay(e)
    }

    const handleSelectEndDay=(e)=>{
        setValueEndDay(e)
    }

    return (
        <Dropdown autoClose = "outside">
            <Dropdown.Toggle>
                Date
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Form className="px-2 py-2">
                    <Stack direction="horizontal" className="mb-3" gap={2}>
                        <div className="flex-grow-1 fw-bold">From</div> 
                        <Dropdown onSelect={handleSelectStartDay}>        
                            <Dropdown.Toggle variant="outline-secondary" size="sm">
                                {valueStartDay}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="limit-height-dropdown">
                                {Array(31).fill().map((_, index) => (
                                    <Dropdown.Item eventKey={index+1} key={index+1}>{index + 1}</Dropdown.Item>)
                                )}
                            </Dropdown.Menu>
                        </Dropdown>
                        <Dropdown onSelect={handleSelectFM}>        
                            <Dropdown.Toggle variant="outline-secondary" size="sm">
                                {valueFM}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="limit-height-dropdown">
                                {months.map((month, index) => (
                                    <Dropdown.Item eventKey={month} key={index}>{month}</Dropdown.Item>)
                                )}
                            </Dropdown.Menu>
                        </Dropdown>
                        <Dropdown onSelect={handleSelectFY}>
                            <Dropdown.Toggle variant="outline-secondary" size="sm">
                                {valueFY}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="limit-height-dropdown">
                                {years.map((year, index) => (
                                    <Dropdown.Item eventKey={year} key={index}>{year}</Dropdown.Item>)
                                )}
                            </Dropdown.Menu>
                        </Dropdown>    
                    </Stack>
                    <Stack direction="horizontal" gap={2}>
                        <div className="flex-grow-1 fw-bold">To</div>
                        <Dropdown onSelect={handleSelectEndDay}>        
                            <Dropdown.Toggle variant="outline-secondary" size="sm">
                                {valueEndDay}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="limit-height-dropdown">
                                {Array(31).fill().map((_, index) => (
                                    <Dropdown.Item eventKey={index+1} key={index+1}>{index + 1}</Dropdown.Item>)
                                )}
                            </Dropdown.Menu>
                        </Dropdown>
                        <Dropdown onSelect={handleSelectTM}>        
                            <Dropdown.Toggle variant="outline-secondary" size="sm">
                                {valueTM}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="limit-height-dropdown">
                                {months.map((month, index) => (
                                    <Dropdown.Item eventKey={month} key={index}>{month}</Dropdown.Item>)
                                )}
                            </Dropdown.Menu>
                        </Dropdown>
                        <Dropdown onSelect={handleSelectTY}>
                            <Dropdown.Toggle variant="outline-secondary" size="sm">
                                {valueTY}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="limit-height-dropdown">
                                {years.map((year, index) => (
                                    <Dropdown.Item eventKey={year} key={index}>{year}</Dropdown.Item>)
                                )}
                            </Dropdown.Menu>
                        </Dropdown>
                    </Stack>
                </Form>
            </Dropdown.Menu>
        </Dropdown>
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
                    <FilterSelector/>
                    <TimeSelector/>
                    <DateSelector/>
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

        const[buses, setBus] = useState([]);
        const[routes, setRoutes] = useState([]);
        const[stops, setStops] = useState([]);
    
        const [filter, setFilter] = useState({
            routes: [],
            buses: [],
        })

        const [valueFM, setValueFM]=useState('Jan')
        const [valueFY, setValueFY]=useState(2018)
        const [valueTM, setValueTM]=useState('Dec')
        const [valueTY, setValueTY]=useState(2020)
        const[valueStartDay, setValueStartDay]=useState(1)
        const[valueEndDay, setValueEndDay]=useState(31)
        //const[valueStartTime, setValueStartTime]=useState(1)
       // const[fromText, setValueEndTime]=useState(1)

        const months = {"Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May":5 , "June": 6, "July": 7, "Aug": 8, "Sept": 9, "Oct": 10, "Nov": 11, "Dec": 12}
        var startDate = new Date(valueFY, months[valueFM] -1 , valueStartDay).toISOString().substr(0, 10);;
        var endDate = new Date(valueTY, months[valueTM] -1 , valueEndDay).toISOString().substr(0, 10);;
        //var startdate = valueFY + "-" + "0" + (d.getMonth()).slice(-2) + "-" + ("0" + d.getDate()).slice(-2)
        //var enddate = valueTY + "-" + ("0" + (d.getMonth())).slice(-2) + "-" + ("0" + d.getDate()).slice(-2)
    
        const fetchBusData = async () => {
            fetch("https://transit-ninerlytics.com/api/buses").then(response => response.json())
            .then(data => setBus(data));
            }
    
        const fetchRoutesData = async () => {
            fetch("https://transit-ninerlytics.com/api/routes").then(response => response.json())
            .then(data => setRoutes(data));
                }
    
        const fetchStopsData = async () => {
            fetch("https://transit-ninerlytics.com/api/stops").then(response => response.json())
            .then(data => setStops(data));
                    }
    
        useEffect(() => {
           
            fetchBusData()
            fetchStopsData()
            fetchRoutesData()
    
        },[]);

    return (
        <BrowserRouter>
            <AppContext.Provider value={{filter, setFilter, buses, routes, stops, valueFM, setValueFM, valueFY, setValueFY, valueTM, setValueTM, valueTY, setValueTY, setValueStartDay, valueStartDay, setValueEndDay, valueEndDay, startDate, endDate}}>
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
